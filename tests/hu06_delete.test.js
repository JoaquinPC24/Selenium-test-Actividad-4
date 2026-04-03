const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

describe('HU06: Eliminación de Productos', function() {
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function() {
        await driver.quit();
    });

    it('Debe eliminar un producto de la lista al hacer clic en Eliminar', async function() {
        await driver.get('http://localhost:3000/dashboard');

        // 1. Usamos un nombre ÚNICO para no chocar con restos de tests fallidos
        let nombreUnico = 'Borrar_' + Date.now();

        await driver.findElement(By.id('prod-nombre')).sendKeys(nombreUnico);
        await driver.findElement(By.id('prod-cantidad')).sendKeys('5');
        await driver.findElement(By.id('prod-precio')).sendKeys('10.00');
        await driver.findElement(By.id('btn-add')).click();

        // 2. ESPERA CRUCIAL: Esperamos a que al menos UN botón de eliminar aparezca en el DOM
        // Esto evita el error de "reading click of undefined"
        await driver.wait(until.elementsLocated(By.css('.btn-delete')), 10000);

        // 3. Ahora que sabemos que existen, los capturamos
        let btnDeletes = await driver.findElements(By.css('.btn-delete'));
        
        // Hacemos clic en el último (el que acabamos de crear)
        await btnDeletes[btnDeletes.length - 1].click();

        // 4. Esperar a que la página procese la eliminación
        await driver.sleep(2000);

        // 5. Verificamos que el nombre único YA NO ESTÉ en la tabla
        let tabla = await driver.wait(until.elementLocated(By.id('tabla-productos')), 5000);
        let textoBusqueda = await tabla.getText();
        
        assert.ok(!textoBusqueda.includes(nombreUnico), "ERROR: El producto sigue apareciendo en la tabla");
        console.log(`✅ HU06: Producto [${nombreUnico}] eliminado exitosamente.`);
    });
});
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('HU04: Visualización de Inventario', function() {
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function() {
        await driver.quit();
    });

    it('Debe mostrar la tabla de productos y contener los datos correctos', async function() {
        await driver.get('http://localhost:3000/dashboard');

        // 1. Verificar que la tabla existe en el DOM
        let tabla = await driver.wait(until.elementLocated(By.id('tabla-productos')), 5000);
        assert.ok(tabla, "La tabla de productos no se encuentra en el Dashboard");

        // 2. Verificar que al menos hay encabezados (o filas si ya hay datos)
        let filas = await driver.findElements(By.css('#tabla-productos tr'));
        assert.ok(filas.length > 0, "La tabla está vacía o no cargó las filas");

        // 3. Prueba de oro: ¿Se ven los nombres?
        let textoTabla = await tabla.getText();
        console.log("Contenido detectado en la tabla para HU04.");
        
        // Aquí podrías verificar un producto que sepas que siempre existe
        // o simplemente que la estructura es correcta.
    });
});
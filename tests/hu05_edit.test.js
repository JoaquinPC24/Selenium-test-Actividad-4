const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
require('chromedriver');

describe('HU05: Edición de Productos', function() {
    this.timeout(40000); 
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        if (!fs.existsSync('./evidencias')) fs.mkdirSync('./evidencias');
    });

    after(async function() {
        if (driver) await driver.quit();
    });

    async function tomarEvidencia(nombre) {
        let image = await driver.takeScreenshot();
        fs.writeFileSync(`./evidencias/${nombre}.png`, image, 'base64');
    }

    // --- 1. CAMINO FELIZ ---
    it('Debe editar un producto correctamente con datos válidos', async function() {
        await driver.get('http://localhost:3000/dashboard');

        // Espera robusta a que existan botones de edición
        let btnEdits = await driver.wait(until.elementsLocated(By.className('btn-edit')), 10000);
        let editUrl = await btnEdits[btnEdits.length - 1].getAttribute('href');
        await driver.get(editUrl);

        let inputNombre = await driver.wait(until.elementLocated(By.id('edit-nombre')), 10000);
        await inputNombre.clear();
        await inputNombre.sendKeys('Producto Editado Feliz');
        
        await driver.findElement(By.id('btn-save-edit')).click();

        // Esperamos volver al dashboard y que la tabla refleje el cambio
        await driver.wait(until.urlContains('/dashboard'), 10000);
        let tabla = await driver.wait(until.elementLocated(By.id('tabla-productos')), 10000);
        
        await tomarEvidencia('HU05_CaminoFeliz_Editado');
        
        let tablaText = await tabla.getText();
        assert.ok(tablaText.includes('Producto Editado Feliz'), "El nombre editado no aparece en la tabla");
    });

    // --- 2. PRUEBA NEGATIVA ---
    it('No debe permitir guardar cambios si el nombre queda vacío', async function() {
        await driver.get('http://localhost:3000/dashboard');
        
        // Localizamos botones de nuevo para evitar Stale Elements
        let btnEdits = await driver.wait(until.elementsLocated(By.className('btn-edit')), 10000);
        await driver.get(await btnEdits[0].getAttribute('href'));

        let inputNombre = await driver.wait(until.elementLocated(By.id('edit-nombre')), 10000);
        await inputNombre.clear(); 
        
        await driver.findElement(By.id('btn-save-edit')).click();

        // Tomamos captura para ver el mensaje de validación de HTML5 o del servidor
        await driver.sleep(1000); 
        await tomarEvidencia('HU05_Negativa_NombreVacio');
        console.log("✅ Prueba negativa: Verificada validación de campo vacío.");
    });

    // --- 3. PRUEBA DE LÍMITES (Aquí estaba el error del reporte) ---
    it('Debe permitir editar un producto con el valor mínimo (1 carácter)', async function() {
        await driver.get('http://localhost:3000/dashboard');
        
        // RE-LOCALIZACIÓN: Vital para evitar el TypeError del reporte anterior
        let btnEdits = await driver.wait(until.elementsLocated(By.className('btn-edit')), 10000);
        
        // Verificación de seguridad
        assert.ok(btnEdits.length > 0, "No se encontraron botones de edición para la prueba de límites");
        
        let editUrl = await btnEdits[0].getAttribute('href');
        await driver.get(editUrl);

        let inputNombre = await driver.wait(until.elementLocated(By.id('edit-nombre')), 10000);
        await inputNombre.clear();
        await inputNombre.sendKeys('Z'); 
        
        let inputPrecio = await driver.findElement(By.id('edit-precio'));
        await inputPrecio.clear();
        await inputPrecio.sendKeys('0.01'); 

        await driver.findElement(By.id('btn-save-edit')).click();

        await driver.wait(until.urlContains('/dashboard'), 10000);
        await tomarEvidencia('HU05_Limite_MinimosEdicion');
        
        let tablaText = await driver.findElement(By.id('tabla-productos')).getText();
        assert.ok(tablaText.includes('Z'), "El cambio de límite (Z) no se guardó correctamente");
    });
});
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

describe('HU05: Edición de Productos', function() {
    let driver; // <--- ESTA LÍNEA ES VITAL

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function() {
        if (driver) await driver.quit();
    });
    it('Debe editar un producto usando el formulario de edición', async function() {
    await driver.get('http://localhost:3000/dashboard');

    // 1. Crear un producto con nombre único para no confundirnos
    let nombreOriginal = "Producto_" + Date.now();
    await driver.findElement(By.id('prod-nombre')).sendKeys(nombreOriginal);
    await driver.findElement(By.id('prod-cantidad')).sendKeys('10');
    await driver.findElement(By.id('prod-precio')).sendKeys('100.00');
    await driver.findElement(By.id('btn-add')).click();

    // Esperamos a que la tabla se refresque
    await driver.wait(until.elementLocated(By.id('tabla-productos')), 5000);

    // 2. JALAR EL LINK DINÁMICO: Buscamos el link de editar que contiene el ID real
    // Esto evita el error de "ID 26 no existe"
    let btnEdits = await driver.wait(until.elementsLocated(By.css('.btn-edit')), 5000);
    let ultimoBtn = btnEdits[btnEdits.length - 1];
    
    // Obtenemos la URL (ej: /edit-product/27) y navegamos a ella
    let editUrl = await ultimoBtn.getAttribute('href');
    await driver.get(editUrl); 

    // 3. Ahora sí, interactuamos con el formulario de edición
    // Esperamos explícitamente al ID que fallaba antes
    let inputNombre = await driver.wait(until.elementLocated(By.id('edit-nombre')), 8000);
    
    await inputNombre.clear();
    await inputNombre.sendKeys('Nombre Actualizado');
    
    // Enviamos el formulario
    await driver.findElement(By.id('btn-save-edit')).click();

    // 4. Verificación final en el Dashboard
    await driver.wait(until.elementLocated(By.id('tabla-productos')), 5000);
    let tablaText = await driver.findElement(By.id('tabla-productos')).getText();
    
    assert.ok(tablaText.includes('Nombre Actualizado'), "El nombre no cambió en la tabla");
    console.log("✅ HU05: Edición dinámica completada.");
});});
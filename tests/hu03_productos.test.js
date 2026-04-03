const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

// 1. Añadimos function() regular para que 'this' funcione con Mocha
describe('HU03: Gestión de Inventario', function() {
    
    // 🔥 SOLUCIÓN 1: Le damos 30 segundos a Mocha para no cortar el test
    this.timeout(30000); 

    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function() {
        await driver.quit();
    });

   it('Debe agregar un nuevo producto y mostrarlo en la tabla', async function() {
    await driver.get('http://localhost:3000/dashboard');

    // 1. Llenar el formulario (esto está bien)
    await driver.wait(until.elementLocated(By.id('btn-add')), 10000);
    await driver.findElement(By.id('prod-nombre')).sendKeys('Laptop Dell');
    await driver.findElement(By.id('prod-cantidad')).sendKeys('10');
    await driver.findElement(By.id('prod-precio')).sendKeys('750.50');
    
    // 2. Hacemos clic
    await driver.findElement(By.id('btn-add')).click();

    // 3. NUEVA LÓGICA: Esperar a que el cuerpo de la página contenga el texto
    // En lugar de guardar 'tabla' en una variable, esperamos al TEXTO en el body.
    // Esto es inmune al refresh de la página.
    await driver.wait(until.elementLocated(By.tagName('body')), 10000);
    
    // 4. Verificación directa sobre el DOM actualizado
    // Buscamos un elemento que contenga el texto dentro de la tabla de forma dinámica
    let tablaActualizada = await driver.wait(
        until.elementLocated(By.xpath("//table[@id='tabla-productos']//td[contains(., 'Laptop Dell')]")), 
        10000
    );

    let textoEncontrado = await tablaActualizada.getText();
    assert.ok(textoEncontrado.includes('Laptop Dell'));
    
    console.log("✅ Producto agregado y verificado con éxito.");
});});
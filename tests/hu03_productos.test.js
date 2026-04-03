const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
require('chromedriver');

describe('HU03: Gestión de Inventario', function() {
    this.timeout(30000); 
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        if (!fs.existsSync('./evidencias')) fs.mkdirSync('./evidencias');
    });

    after(async function() {
        await driver.quit();
    });

    async function tomarEvidencia(nombre) {
        let image = await driver.takeScreenshot();
        fs.writeFileSync(`./evidencias/${nombre}.png`, image, 'base64');
    }

    // --- 1. CAMINO FELIZ ---
    it('Debe agregar un nuevo producto y mostrarlo en la tabla', async function() {
        await driver.get('http://localhost:3000/dashboard');
        await driver.findElement(By.id('prod-nombre')).sendKeys('Laptop Dell');
        await driver.findElement(By.id('prod-cantidad')).sendKeys('10');
        await driver.findElement(By.id('prod-precio')).sendKeys('750.50');
        await driver.findElement(By.id('btn-add')).click();

        // ESPERA A QUE EL ELEMENTO SE REFRESCQUE EN EL DOM
        const xpathProd = "//td[contains(., 'Laptop Dell')]";
        let productoCelda = await driver.wait(until.elementLocated(By.xpath(xpathProd)), 10000);
        
        let texto = await productoCelda.getText();
        assert.ok(texto.includes('Laptop Dell'));
        console.log("✅ Camino Feliz: Producto verificado.");
    });

    // --- 2. PRUEBA NEGATIVA ---
    it('No debe permitir agregar un producto con precio negativo o cero', async function() {
        await driver.get('http://localhost:3000/dashboard');
        
        await driver.wait(until.elementLocated(By.id('btn-add')), 10000);
        await driver.findElement(By.id('prod-nombre')).sendKeys('Producto Error');
        await driver.findElement(By.id('prod-cantidad')).sendKeys('5');
        await driver.findElement(By.id('prod-precio')).sendKeys('-10'); // Valor inválido
        
        await driver.findElement(By.id('btn-add')).click();

        // Verificamos que NO se agregó (la tabla no debe tener 'Producto Error')
        let bodyText = await driver.findElement(By.tagName('body')).getText();
        
        await tomarEvidencia('HU03_Negativa_PrecioInvalido'); // 📸 CAPTURA
        
        assert.ok(!bodyText.includes('Producto Error'), "El producto inválido se guardó en la tabla");
    });

    // --- 3. PRUEBA DE LÍMITES (Boundary) ---
    it('Debe permitir agregar un producto con los valores mínimos permitidos', async function() {
        await driver.get('http://localhost:3000/dashboard');
        
        await driver.wait(until.elementLocated(By.id('btn-add')), 10000);
        await driver.findElement(By.id('prod-nombre')).sendKeys('A'); // Nombre mínimo (1 caracter)
        await driver.findElement(By.id('prod-cantidad')).sendKeys('1'); // Cantidad mínima
        await driver.findElement(By.id('prod-precio')).sendKeys('0.01'); // Precio mínimo
        
        await driver.findElement(By.id('btn-add')).click();

        const xpathLimite = "//table[@id='tabla-productos']//td[contains(., 'A')]";
        await driver.wait(until.elementLocated(By.xpath(xpathLimite)), 10000);
        
        await tomarEvidencia('HU03_Limite_Minimos'); // 📸 CAPTURA
        
        console.log("✅ Prueba de Límites: Valores mínimos aceptados.");
    });
});
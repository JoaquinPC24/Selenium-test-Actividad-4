const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
require('chromedriver');

describe('HU02: Inicio de Sesión', function() {
    this.timeout(30000);
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        if (!fs.existsSync('./evidencias')) fs.mkdirSync('./evidencias');
    });

    after(async function() {
        await driver.quit();
    });

    async function tomarCaptura(nombre) {
        let image = await driver.takeScreenshot();
        fs.writeFileSync(`./evidencias/${nombre}.png`, image, 'base64');
    }

    // --- 1. PRUEBA NEGATIVA ---
    it('Debe fallar con credenciales incorrectas', async function() {
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.id('login-email')).sendKeys('correo@falso.com');
        await driver.findElement(By.id('login-password')).sendKeys('error123');
        await driver.findElement(By.id('btn-login')).click();

        let errorMsg = await driver.wait(until.elementLocated(By.id('error-login')), 5000);
        await tomarCaptura('HU02_Negativa_CredencialesErroneas');
        
        let texto = await errorMsg.getText();
        assert.strictEqual(texto, "Credenciales incorrectas.");
    });

    // --- 2. PRUEBA DE LÍMITES (Boundary) ---
    // Probamos el login con el límite mínimo de contraseña permitido (8 caracteres)
    it('Debe permitir el login con contraseña de exactamente 8 caracteres', async function() {
        await driver.get('http://localhost:3000/login');
        // Usamos el usuario creado en la prueba de límites del registro
        await driver.findElement(By.id('login-email')).sendKeys('limite1@mail.com');
        await driver.findElement(By.id('login-password')).sendKeys('acdssg52'); 
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 5000);
        await tomarCaptura('HU02_Limite_PasswordMinima');
        
        let url = await driver.getCurrentUrl();
        assert.ok(url.includes('/dashboard'));
    });

    // --- 3. CAMINO FELIZ ---
    it('Debe entrar correctamente con el usuario de prueba estándar', async function() {
        await driver.get('http://localhost:3000/login');
        
        let inputEmail = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
        await inputEmail.sendKeys('test@correo.com');
        await driver.findElement(By.id('login-password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 5000);
        await tomarCaptura('HU02_CaminoFeliz_Exito');
        
        let url = await driver.getCurrentUrl();
        assert.ok(url.includes('/dashboard'));
    });
});
const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

describe('HU02: Inicio de Sesión', function() {
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function() {
        await driver.quit();
    });

    it('Debe fallar con credenciales incorrectas', async function() {
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.id('login-email')).sendKeys('correo@falso.com');
        await driver.findElement(By.id('login-password')).sendKeys('error123');
        await driver.findElement(By.id('btn-login')).click();

        let errorMsg = await driver.wait(until.elementLocated(By.id('error-login')), 5000);
        let texto = await errorMsg.getText();
        assert.strictEqual(texto, "Credenciales incorrectas.");
    });

it('Debe entrar correctamente con el usuario admin_real', async function() {
    await driver.get('http://localhost:3000/login');
    
    // ESPERA EXPLICITA: No busques el elemento a lo loco
    let inputEmail = await driver.wait(until.elementLocated(By.id('login-email')), 5000);
    await inputEmail.sendKeys('test@correo.com');
    await driver.findElement(By.id('login-password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Verificamos que entró al dashboard
    await driver.wait(until.urlContains('/dashboard'), 5000);
    let url = await driver.getCurrentUrl();
    assert.ok(url.includes('/dashboard'));
});
});
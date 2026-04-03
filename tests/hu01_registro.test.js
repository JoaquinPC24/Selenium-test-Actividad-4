const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

describe('HU01: Registro de Usuario', function() {
    let driver;

    // Esto se ejecuta antes de empezar
    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    // Esto se ejecuta al terminar
    after(async function() {
        await driver.quit();
    });

    it('Debe mostrar error si la contraseña tiene menos de 8 caracteres', async function() {
        await driver.get('http://localhost:3000/register');
        await driver.findElement(By.id('username')).sendKeys('user_test');
        await driver.findElement(By.id('email')).sendKeys('test@mail.com');
        await driver.findElement(By.id('password')).sendKeys('123456');
        await driver.findElement(By.id('btn-register')).click();

        let errorMsg = await driver.wait(until.elementLocated(By.id('error-message')), 5000);
        let texto = await errorMsg.getText();
        assert.strictEqual(texto, "La contraseña debe tener al menos 8 caracteres.");
    });

it('Debe registrar exitosamente con datos válidos', async function() {
    await driver.get('http://localhost:3000/register');
    await driver.findElement(By.name('username')).sendKeys('usuarioTest6');
    await driver.findElement(By.name('email')).sendKeys('test@correo6.com');
    await driver.findElement(By.name('password')).sendKeys('password123');
    await driver.findElement(By.css('button[type="submit"]')).click();

    // En lugar de buscar el texto, verificamos que nos mandó al login
    await driver.wait(until.urlContains('/login'), 5000);
    let currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.includes('/login'), "No redirigió al login tras el registro");
});});
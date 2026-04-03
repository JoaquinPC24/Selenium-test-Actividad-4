const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
require('chromedriver');

describe('HU07: Cierre de Sesión', function() {
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
    });

    after(async function() {
        if (driver) await driver.quit();
    });

    it('Debe redirigir al login al hacer clic en Cerrar Sesión', async function() {
        // 1. Primero entramos al dashboard
        await driver.get('http://localhost:3000/dashboard');

        // 2. Buscamos el botón de logout y hacemos clic
        let btnLogout = await driver.wait(until.elementLocated(By.id('btn-logout')), 10000);
        await btnLogout.click();

        // 3. Verificamos que la URL ahora contenga /login
        await driver.wait(until.urlContains('/login'), 15000);
        let currentUrl = await driver.getCurrentUrl();
        
        assert.ok(currentUrl.includes('/login'), "El usuario no fue redirigido al Login");
        
        // 4. Verificamos que el formulario de login esté presente
        let formLogin = await driver.findElement(By.id('login-email'));
        assert.ok(formLogin, "No se encontró el formulario de login tras cerrar sesión");
        
        console.log("✅ HU07: Logout verificado exitosamente.");
    });
});
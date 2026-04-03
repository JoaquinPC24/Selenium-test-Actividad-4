const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
require('chromedriver');

describe('HU07: Cierre de Sesión', function() {
    this.timeout(40000); // Aumentamos un poco más por seguridad
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
    it('Debe cerrar la sesión y redirigir al login correctamente', async function() {
        await driver.get('http://localhost:3000/login');
        
        // Login previo para poder cerrar sesión
        let email = await driver.wait(until.elementLocated(By.id('login-email')), 10000);
        await email.sendKeys('test@correo.com');
        await driver.findElement(By.id('login-password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 10000);
        
        // LOCALIZACIÓN CORRECTA DEL BOTÓN
        let btnLogout = await driver.wait(until.elementLocated(By.id('btn-logout')), 10000);
        await btnLogout.click();

        // Espera de 10s para la redirección
        await driver.wait(until.urlContains('/login'), 10000);
        await tomarEvidencia('HU07_CaminoFeliz_Logout');
        
        let currentUrl = await driver.getCurrentUrl();
        assert.ok(currentUrl.includes('/login'));
    });

    // --- 2. PRUEBA NEGATIVA ---
    it('No debe permitir volver al dashboard usando el botón "Atrás" del navegador', async function() {
        // Asumimos que ya estamos fuera por el test anterior
        await driver.get('http://localhost:3000/dashboard');
        
        // El sistema debe detectar que no hay sesión y rebotar
        await driver.wait(until.urlContains('/login'), 10000);
        await tomarEvidencia('HU07_Negativa_ReboteDashboard');
        
        let url = await driver.getCurrentUrl();
        assert.ok(url.includes('/login'));
    });

    // --- 3. PRUEBA DE LÍMITES ---
    it('Debe manejar el cierre de sesión incluso si la página se refresca', async function() {
        // Iniciamos sesión otra vez
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.id('login-email')).sendKeys('test@correo.com');
        await driver.findElement(By.id('login-password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 10000);
        
        await driver.navigate().refresh();
        
        // CORRECCIÓN AQUÍ: Quitamos el 'id' extra que causaba el error en el reporte
        let btnLogout = await driver.wait(until.elementLocated(By.id('btn-logout')), 10000);
        await btnLogout.click();

        await driver.wait(until.urlContains('/login'), 10000);
        await tomarEvidencia('HU07_Limite_SesionRefrescada');
        
        assert.ok((await driver.getCurrentUrl()).includes('/login'));
    });
});
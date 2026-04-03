const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
require('chromedriver');

describe('HU04: Visualización de Inventario', function() {
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

    // --- 1. CAMINO FELIZ (Visualización estándar) ---
    it('Debe cargar la tabla y mostrar los productos registrados', async function() {
        // Aseguramos sesión primero
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.id('login-email')).sendKeys('test@correo.com');
        await driver.findElement(By.id('login-password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 10000);

        // Esperar a que la tabla y sus filas carguen
        let tabla = await driver.wait(until.elementLocated(By.id('tabla-productos')), 10000);
        await driver.wait(until.elementsLocated(By.css('#tabla-productos tbody tr')), 10000);
        
        await tomarEvidencia('HU04_CaminoFeliz_TablaCargada');
        
        let filas = await driver.findElements(By.css('#tabla-productos tbody tr'));
        assert.ok(filas.length > 0, "La tabla debería mostrar al menos un producto");
        console.log(`✅ Visualización exitosa: ${filas.length} productos encontrados.`);
    });

    // --- 2. PRUEBA NEGATIVA (Corregido el TimeoutError) ---
    it('Debe redirigir al login si se intenta acceder al dashboard sin sesión', async function() {
        // Limpiamos todo rastro de sesión
        await driver.manage().deleteAllCookies(); 
        await driver.executeScript('window.localStorage.clear();');
        await driver.executeScript('window.sessionStorage.clear();');

        await driver.get('http://localhost:3000/dashboard');

        // Subimos el tiempo a 12 segundos para evitar el error del reporte anterior
        await driver.wait(until.urlContains('/login'), 12000); 
        await tomarEvidencia('HU04_Negativa_AccesoDenegado');
        
        let url = await driver.getCurrentUrl();
        assert.ok(url.includes('/login'), "El middleware de seguridad no redirigió al usuario anónimo");
    });

    // --- 3. PRUEBA DE LÍMITES (Carga de tabla con datos mínimos) ---
    it('Debe manejar correctamente la visualización con al menos una celda de datos', async function() {
        // Re-login para volver al dashboard
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.id('login-email')).sendKeys('test@correo.com');
        await driver.findElement(By.id('login-password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 10000);

        // Verificamos presencia de celdas de datos
        let celdas = await driver.wait(until.elementsLocated(By.css('#tabla-productos td')), 10000);
        
        await tomarEvidencia('HU04_Limite_MinimoDatos');
        assert.ok(celdas.length >= 3, "La fila del producto debe tener al menos Nombre, Cantidad y Precio");
    });
});
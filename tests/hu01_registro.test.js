const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs'); // Necesario para guardar las capturas
require('chromedriver');

describe('HU01: Registro de Usuario', function() {
    this.timeout(30000); // Dale tiempo a Selenium
    let driver;

    before(async function() {
        driver = await new Builder().forBrowser('chrome').build();
        // Crear carpeta de evidencias si no existe
        if (!fs.existsSync('./evidencias')) fs.mkdirSync('./evidencias');
    });

    after(async function() {
        await driver.quit();
    });

    // Función auxiliar para cumplir con "Capturas automáticas"
    async function guardarEvidencia(nombre) {
        let image = await driver.takeScreenshot();
        fs.writeFileSync(`./evidencias/${nombre}.png`, image, 'base64');
    }

    // --- 1. PRUEBA NEGATIVA ---
    it('Debe mostrar error si la contraseña tiene menos de 8 caracteres', async function() {
        await driver.get('http://localhost:3000/register');
        await driver.findElement(By.id('username')).sendKeys('user_test');
        await driver.findElement(By.id('email')).sendKeys('test@mail.com');
        await driver.findElement(By.id('password')).sendKeys('123456'); // Solo 6
        await driver.findElement(By.css('button[type="submit"]')).click();

        let errorMsg = await driver.wait(until.elementLocated(By.id('error-message')), 5000);
        await guardarEvidencia('HU01_Negativa_PasswordCorta'); // 📸 CAPTURA
        
        let texto = await errorMsg.getText();
        assert.strictEqual(texto, "La contraseña debe tener al menos 8 caracteres.");
    });

    // --- 2. PRUEBA DE LÍMITES (Boundary) ---
    it('Debe permitir el registro con el límite mínimo (exactamente 8 caracteres)', async function() {
        await driver.get('http://localhost:3000/register');
        await driver.findElement(By.id('username')).sendKeys('limite_test');
        await driver.findElement(By.id('email')).sendKeys('limite1@mail.com');
        await driver.findElement(By.id('password')).sendKeys('acdssg52'); // Justo 8
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/login'), 5000);
        await guardarEvidencia('HU01_Limite_Exactamente8'); // 📸 CAPTURA
        
        assert.ok((await driver.getCurrentUrl()).includes('/login'));
    });

    // --- 3. CAMINO FELIZ ---
    it('Debe registrar exitosamente con datos válidos', async function() {
        await driver.get('http://localhost:3000/register');
        const randomUser = 'user' + Math.floor(Math.random() * 1000); // Para que no falle por usuario repetido
        await driver.findElement(By.id('username')).sendKeys(randomUser);
        await driver.findElement(By.id('email')).sendKeys(randomUser + '@mail.com');
        await driver.findElement(By.id('password')).sendKeys('passwordSegura123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/login'), 5000);
        await guardarEvidencia('HU01_CaminoFeliz_Exito'); // 📸 CAPTURA
        
        assert.ok((await driver.getCurrentUrl()).includes('/login'));
    });
});
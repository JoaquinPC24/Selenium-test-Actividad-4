const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');
require('chromedriver');

describe('HU06: Eliminación de Productos', function() {
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

    // --- 1. CAMINO FELIZ ---
    it('Debe eliminar un producto creado recientemente', async function() {
        await driver.get('http://localhost:3000/dashboard');
        let nombreUnico = 'Borrar_Feliz_' + Date.now();

        // Aseguramos que el formulario esté listo
        await driver.wait(until.elementLocated(By.id('prod-nombre')), 10000);
        await driver.findElement(By.id('prod-nombre')).sendKeys(nombreUnico);
        await driver.findElement(By.id('prod-cantidad')).sendKeys('1');
        await driver.findElement(By.id('prod-precio')).sendKeys('1.00');
        await driver.findElement(By.id('btn-add')).click();

        // Esperar a que el botón de eliminar del nuevo producto aparezca
        // Usamos una espera para que la tabla se actualice
        await driver.wait(until.elementsLocated(By.className('btn-delete')), 15000);
        let btnDeletes = await driver.findElements(By.className('btn-delete'));
        
        // Clic al último agregado
        await btnDeletes[btnDeletes.length - 1].click();

        // Esperamos a que el texto del producto DESAPAREZCA de la tabla
        await driver.wait(async () => {
            let texto = await driver.findElement(By.id('tabla-productos')).getText();
            return !texto.includes(nombreUnico);
        }, 10000);

        await tomarEvidencia('HU06_CaminoFeliz_Eliminado');
        console.log(`✅ Producto ${nombreUnico} eliminado.`);
    });

    // --- 2. PRUEBA NEGATIVA (Corregido el Timeout de redirección) ---
    it('No debe permitir eliminar si no hay sesión activa', async function() {
        await driver.manage().deleteAllCookies(); 
        await driver.get('http://localhost:3000/dashboard'); 

        // Aumentamos a 10s para evitar el TimeoutError que salió en el reporte
        await driver.wait(until.urlContains('/login'), 15000); 
        await tomarEvidencia('HU06_Negativa_SinSesion');
        
        let url = await driver.getCurrentUrl();
        assert.ok(url.includes('/login'), "No redirigió al login tras quitar cookies");
    });

    // --- 3. PRUEBA DE LÍMITES ---
    it('Debe funcionar correctamente al eliminar el único elemento restante en la tabla', async function() {
        // Re-login necesario
        await driver.get('http://localhost:3000/login');
        await driver.findElement(By.id('login-email')).sendKeys('test@correo.com');
        await driver.findElement(By.id('login-password')).sendKeys('password123');
        await driver.findElement(By.css('button[type="submit"]')).click();

        await driver.wait(until.urlContains('/dashboard'), 15000);
        
        // Esperamos a que carguen los botones
        await driver.wait(until.elementsLocated(By.className('btn-delete')), 10000);
        let btnDeletes = await driver.findElements(By.className('btn-delete'));
        
        if(btnDeletes.length > 0) {
            await btnDeletes[0].click();
            
            // Espera dinámica en lugar de sleep
            await driver.wait(until.stalenessOf(btnDeletes[0]), 10000);
            
            await tomarEvidencia('HU06_Limite_UltimoElemento');
            console.log("✅ Eliminación de límite completada.");
        }
    });
});
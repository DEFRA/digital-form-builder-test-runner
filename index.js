const Lab = require('lab')
const url = require('url')
const bossy = require('bossy')
const driver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const firefox = require('selenium-webdriver/firefox')
const { makeModel } = require('govuk-site-engine-components')

const definition = {
  h: {
    description: 'Show help',
    alias: 'help',
    type: 'boolean'
  },
  u: {
    description: 'The url to test',
    alias: 'url',
    type: 'string',
    require: true
  },
  p: {
    description: 'The metadata file path to test',
    alias: 'path',
    type: 'string',
    require: true
  },
  b: {
    description: 'The browser to test',
    alias: 'browser',
    type: 'string',
    default: 'chrome',
    valid: ['chrome', 'firefox']
  }
}

const fake = require('./fake')
const { By, until, Key } = driver
const lab = exports.lab = Lab.script()
// const args = bossy.parse(definition)

// if (args instanceof Error) {
//   throw args
// }

const args = {
  u: 'http://localhost:3009/',
  p: '../govuk-site/server/govsite',
  b: 'chrome'
}

const baseUrl = args.u
const browserName = args.b

const data = require(args.p)
const model = makeModel(data)

lab.experiment('Metadata Driven e2e Tests', () => {
  let browser

  lab.before(async ({ context }) => {
    browser = await new driver.Builder()
      .forBrowser(browserName)
      .setChromeOptions(new chrome.Options())
      .setFirefoxOptions(new firefox.Options().headless())
      .build()
  })

  // lab.test('Base url', async ({ context }) => {
  //   await browser.get(baseUrl)
  //   await browser.wait(until.urlIs(baseUrl))
  // })

  async function fillFormField (component) {
    if (component.children) {
      if (component.type === 'UkAddressField') {
        // Clicking the postcode search button without a
        // query causes the manual entry form to display
        const find = await browser.findElement(By.css('button.postcode-lookup'))
        await find.click()
      }

      await fillForm(component.children.formItems)
    } else {
      const fieldData = fake(component, model)
      // console.log(fieldData)
      if (component.type === 'DatePartsField') {
        let el = await browser.findElement({ id: `${component.name}__day` })
        await el.clear()
        await el.sendKeys(fieldData.day)
        el = await browser.findElement({ id: `${component.name}__month` })
        await el.clear()
        await el.sendKeys(fieldData.month)
        el = await browser.findElement({ id: `${component.name}__year` })
        await el.clear()
        await el.sendKeys(fieldData.year)
      } else if (component.type === 'DateTimePartsField') {
        let el = await browser.findElement({ id: `${component.name}__day` })
        await el.clear()
        await el.sendKeys(fieldData.day)
        el = await browser.findElement({ id: `${component.name}__month` })
        await el.clear()
        await el.sendKeys(fieldData.month)
        el = await browser.findElement({ id: `${component.name}__year` })
        await el.clear()
        await el.sendKeys(fieldData.year)
        el = await browser.findElement({ id: `${component.name}__hour` })
        await el.clear()
        await el.sendKeys(fieldData.hour)
        el = await browser.findElement({ id: `${component.name}__minute` })
        await el.clear()
        await el.sendKeys(fieldData.minute)
      } else {
        if (component.type === 'SelectField') {
          const el = await browser.findElement({ id: component.name })
          await el.findElement(By.css(`option[value='${fieldData}']`)).click()
        } else if (component.type === 'RadiosField' || component.type === 'YesNoField') {
          const el = await browser.findElement({ id: `${component.name}-${fieldData}` })
          await el.click()
        } else if (component.type === 'DateField') {
          const el = await browser.findElement({ id: component.name })
          const iso = fieldData.toISOString()
          await el.sendKeys(iso.substr(8, 2), iso.substr(5, 2), iso.substr(0, 4))
        } else if (component.type === 'TimeField') {
          const el = await browser.findElement({ id: component.name })
          await el.sendKeys('23:15')
        } else if (component.type === 'DateTimeField') {
          const iso = fieldData.toISOString()
          const el = await browser.findElement({ id: component.name })
          await el.sendKeys(iso.substr(8, 2), iso.substr(5, 2), iso.substr(0, 4),
            Key.ARROW_RIGHT, iso.substr(11, 2), iso.substr(14, 2))
        } else {
          const el = await browser.findElement({ id: component.name })
          await el.clear()
          await el.sendKeys(fieldData)
        }
      }
    }
  }

  async function fillForm (components) {
    for (let i = 0; i < components.length; i++) {
      await fillFormField(components[i])
    }
  }

  model.pages.forEach(page => {
    lab.test(`GET ${page.path}`, async () => {
      const uri = url.resolve(baseUrl, page.path)
      await browser.get(uri)
      await browser.wait(until.urlIs(uri))
      // await browser.wait(until.titleIs(page.title))
    })
  })

  model.pages.forEach(page => {
    lab.test(`POST ${page.path}`, async () => {
      const uri = url.resolve(baseUrl, page.path)
      await browser.get(uri)
      await browser.wait(until.urlIs(uri))

      if (page.components.formItems.length) {
        await fillForm(page.components.formItems)
      }

      const submit = await browser.findElement(By.css('button#submit'))
      return await submit.click()

      // const next = getNext({ section, page })

      // return browser.wait(until.urlIs(next))
    })
  })

  lab.after(async ({ context }) => {
    await browser.quit()
  })
})

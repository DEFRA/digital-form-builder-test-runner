const random = require('./random')

module.exports = function (component, model) {
  const { type, schema, options } = component

  switch (type) {
    case 'TextField':
      if (component.name.endsWith('premises')) {
        return '' + random.integer()
      } else {
        const hasMin = typeof schema.min === 'number'
        const hasMax = typeof schema.max === 'number'
        const isOptional = options.required === false
        const min = hasMin ? schema.min : (isOptional ? 0 : 1)
        const max = hasMax ? schema.max : 60
        const val = random.string(max, min)

        return val
      }
    case 'MultilineTextField':
      const hasMin = typeof schema.min === 'number'
      const hasMax = typeof schema.max === 'number'
      const isOptional = options.required === false
      const min = hasMin ? schema.min : (isOptional ? 0 : 1)
      const max = hasMax ? schema.max : 600
      const val = random.string(max, min)

      return val
    case 'NumberField':
      return random.integer(schema.min, schema.max)
    case 'FullNameField':
      return 'Dr. Jo Smith'
    case 'NationalInsuranceNumberField':
      return 'QQ 12 34 56 C'
    case 'TelephoneNumberField':
      return '01234 567 890'
    case 'EmailAddressField':
      return 'jo.smith@doctors.com'
    case 'BooleanField':
      return random.boolean()
    case 'DateField':
    case 'DateTimeField':
      return random.date()
    case 'YesNoField':
    case 'RadiosField': {
      const list = model.lists.find(list => list.name === options.list)
      const items = list.items
      const values = items.map(item => item.value)
      return random.integer(1, values.length)
    }
    case 'SelectField':
      const list = model.lists.find(list => list.name === options.list)
      const items = list.items
      const values = items.map(item => item.value)
      return values[random.integer(0, values.length - 1)]
    case 'DatePartsField': {
      const date = random.date()
      return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() }
    }
    case 'DateTimePartsField': {
      const date = random.date()
      return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear(), hour: date.getHours(), minute: date.getMinutes() }
    }
  }
}

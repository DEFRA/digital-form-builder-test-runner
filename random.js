function boolean () {
  return Math.random() < 0.5
}

function float (min = 0, max = 1000) {
  return Math.random() * (max - min + 1) + min
}

function integer (min = 0, max = 1000) {
  return Math.floor(float(min, max))
}

function _normalizeRanges (ranges) {
  ranges.sort(function (a, b) {
    return a[0] - b[0]
  })

  for (let i = 0; i < ranges.length - 1; ++i) {
    for (let j = i + 1; j < ranges.length; ++j) {
      // remove right contained
      if (ranges[i][1] >= ranges[j][1]) {
        ranges.splice(j, 1)
        j--
      } else
      // fix overlap
      if (ranges[i][1] >= ranges[j][0]) {
        ranges[j][0] = ranges[i][1] + 1
      }
    }
  }
}

function integerFromRanges (ranges) {
  _normalizeRanges(ranges)
  if (ranges !== null) {
    let span = 0
    for (let i = 0; i < ranges.length; ++i) {
      span += (ranges[i][1] - ranges[i][0] + 1)
    }
    let randomNumber = Math.floor(Math.random() * span)
    for (let j = 0; j < ranges.length; ++j) {
      randomNumber += ranges[j][0]
      if (randomNumber <= ranges[j][1]) {
        break
      } else {
        randomNumber -= (ranges[j][1] + 1)
      }
    }
    return randomNumber
  } else {
    throw new Error('ranges is required.')
  }
}

function integerArrayFromRanges (length, ranges) {
  const numberArray = []
  if (length !== null && ranges !== null) {
    for (let i = 0; i < length; ++i) {
      numberArray[i] = integerFromRanges(ranges)
    }
  } else {
    throw new Error('length and ranges is required.')
  }
  return numberArray
}

function stringFromRanges (maxLength, minLength, ranges) {
  let str = ''
  const length = integer(maxLength, minLength)
  const unicodeNumbers = integerArrayFromRanges(length, ranges)
  str = String.fromCharCode.apply(this, unicodeNumbers)
  return str
}

function date (startDate, endDate = new Date()) {
  const endDateTime = endDate.getTime()
  const startDateTime = startDate ? startDate.getTime() : 0
  return new Date(integer(startDateTime, endDateTime))
}

function string (minLength, maxLength = 1000) {
  return stringFromRanges(maxLength, minLength, [ [ 32, 126 ] ])
}

const random = {
  boolean: boolean,
  integer: integer,
  float: float,
  date: date,
  string: string
}

module.exports = random

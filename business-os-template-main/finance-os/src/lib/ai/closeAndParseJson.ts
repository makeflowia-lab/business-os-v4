// Parser de JSON parcial para streaming
// Cierra automaticamente brackets incompletos

export function closeAndParseJson(str: string): unknown | null {
  const stack: string[] = []
  let i = 0

  while (i < str.length) {
    const char = str[i]
    const last = stack.at(-1)

    if (char === '"') {
      if (i > 0 && str[i - 1] === '\\') {
        i++
        continue
      }
      if (last === '"') {
        stack.pop()
      } else {
        stack.push('"')
      }
    }

    if (last === '"') {
      i++
      continue
    }

    if (char === '{' || char === '[') {
      stack.push(char)
    }
    if (char === '}' && last === '{') stack.pop()
    if (char === ']' && last === '[') stack.pop()

    i++
  }

  let closed = str
  for (let j = stack.length - 1; j >= 0; j--) {
    const opening = stack[j]
    if (opening === '{') closed += '}'
    if (opening === '[') closed += ']'
    if (opening === '"') closed += '"'
  }

  try {
    return JSON.parse(closed)
  } catch {
    return null
  }
}

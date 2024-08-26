import config from '../src/qweb/config.json'
export function getProgram(instructions) {
  return instructions.join('\n')
}

export function assertRegisters(hexValues) {
  hexValues.forEach((hex, i) => {
    cy.get(`[data-test-id="R${i}"]`).should('have.text', '0x' + hex)
  })
}

export function rewriteConfig(key, value){
  const local = JSON.parse(localStorage.getItem('qweb-config')) || config
  local[key] = value
  localStorage.setItem('qweb-config', JSON.stringify(local))
}
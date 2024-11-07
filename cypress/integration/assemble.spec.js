/// <reference types="cypress" />
import { getProgram, assertRegisters } from "../helper"

context('Assemble', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Assemble without specifying first ensemble and with RET', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'CALL 0xABCD', '[ASSEMBLE: 0xABCD]', 'MOV R2, 0x0002', 'RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[data-test-id="PC"]').should('have.text', '0x0004')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })

  it('Assemble specifying first ensemble and with RET', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['[ASSEMBLE: 0x0003]', 'MOV R1, 0x0001', 'CALL 0xABCD', '[ASSEMBLE: 0xABCD]', 'MOV R2, 0x0002', 'RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[data-test-id="PC"]').should('have.text', '0x0007')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })
})

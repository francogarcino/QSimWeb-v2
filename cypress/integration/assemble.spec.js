/// <reference types="cypress" />
import { getProgram, assertRegisters } from "../helper"

context('Assemble', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Assemble without specifying first ensemble and with RET', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'CALL rut', '[assemble: 0xABCD]', 'rut: MOV R2, 0x0002', 'RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[data-test-id="PC"]').should('have.text', '0x0004')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })

  it('Assemble 2 routines and call routine inside one of them', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['CALL rut', '[assemble: 0x0003]', 'rut:MOV R1, 0x0001','CALL otraRut', 'RET', '[assemble: 0xABCD]', 'otraRut: MOV R2, 0x0002', 'RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[data-test-id="PC"]').should('have.text', '0x0002')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })
})

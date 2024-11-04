/// <reference types="cypress" />
import { getProgram, assertRegisters } from "../helper"

context('Ejecutions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Valid program shows success message and the registers have the correct value ', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'MOV R2, 0x0002']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[id="results-box-id"]').should('have.value', 'La ejecución del programa fue exitosa')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })

  it('Valid program with a rutine assembled in [0xcccc] shows succes message and has some value in [0xcccc]', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'CALL foo', '[ASSEMBLE: 0xCCCC]', 'foo: MOV R2, 0x0002', 'RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[id="results-box-id"]').should('have.value', 'La ejecución del programa fue exitosa')

    cy.get(`[data-test-id="0xCCCC"]`).should('have.text', '0x1880')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })

  it('Valid program with one simple instruction has the PC at 0x0001 when finished', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, R2']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[data-test-id="PC"]').should('have.text', '0x0001')
  })

  it('Valid program with 4 simple instructions has the PC at 0x0004 when finished', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, R2', 'MOV R2, R2', 'MOV R3, R2', 'MOV R4, R2']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[data-test-id="PC"]').should('have.text', '0x0004')
  })

  it('Detailed Execution with verbose actions_mode displays the assembled cells', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, R2']))
    cy.get('[id="Ejecutar una instrucción detallada-button-id"]').click()
    cy.get('[class="MuiSnackbarContent-message"]')
      .contains('Se ensambló en la celda [0x0000] El valor: 0x1862')
  })

  it('Valid program with comments shows success message and the registers have the correct value', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'MOV R2, 0x0002#aComment', '#anOtherComment']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[id="results-box-id"]').should('have.value', 'La ejecución del programa fue exitosa')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })

  it('Executes invalid program, then valid one error must not be displayed', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['CALL rutina', '[assemble:0x2302]', 'rutina: MOV R1, 0x0020']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[id="client-snackbar"]').should('exist')
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(8000)
    
    cy.get('[id="ace-editor"]')
      .type(getProgram(['', 'RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[id="client-snackbar"]').should('not.exist')
  })

  it('Valid program indented in any way shows success message and the registers have the correct value ', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['     MOV R1,    0x0001', 'CALL  foo', '  [assemble: 0x00FF]', '   foo:    MOV    R2,  0x0002', '  RET']))

    cy.get('[id="Ejecutar-button-id"]').click()

    cy.get('[id="results-box-id"]').should('have.value', 'La ejecución del programa fue exitosa')

    assertRegisters(['0000', '0001', '0002', '0000', '0000', '0000', '0000', '0000'])
  })
})

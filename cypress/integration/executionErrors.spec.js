/// <reference types="cypress" />
import { getProgram } from "../helper"

context('Ejecution Errors', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('When dividing by zero, an error is displayed correctly', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['DIV R1, 0x0000']))

    cy.get('[id="execute-button-id"]').click()

    cy.get('[id="client-snackbar"]').should('have.text', 'No es posible dividir por 0')
  })

  it('Runing a program with an incomplete routine', () => {
    const program = ['CALL routine',  '[ASSEMBLE: 0xCCCC]', "routine: MOV R3, 0x0002", ]
    cy.get('[id="ace-editor"]')
      .type(getProgram(program))

    cy.get('[id="execute-button-id"]').click()

    cy.get('[id="client-snackbar"]').should('have.text', 'Hubo un error, es posible que te falte un RET')
  })

  it('Runing a routine without a CALL', () => {
    const program = ['MOV R3, 0x0002', 'RET']
    cy.get('[id="ace-editor"]')
      .type(getProgram(program))

    cy.get('[id="execute-button-id"]').click()

    cy.get('[id="client-snackbar"]').should('have.text', "Hubo un error, es posible que tengas un RET sin un CALL")
  })
})

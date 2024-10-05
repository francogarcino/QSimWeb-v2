/// <reference types="cypress" />
import { getProgram } from "../helper"

context('Syntax Errors', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Writing a program with sintax errors', () => {
    const program = ['mv r0 r1', '']
    cy.get('[id="ace-editor"]')
      .type(getProgram(program))

    cy.get('[id="results-box-id"]').should('have.value', `\nHubo un error de sintaxis: \n${program[0]}\n  ^`)
  })

  it('Fixing a program with syntax errors clears the error message', () => {
    const program = ['mv r0 r1', '']
    cy.get('[id="ace-editor"]')
      .type(getProgram(program))

    cy.get('[id="results-box-id"]').should('have.value', `\nHubo un error de sintaxis: \n${program[0]}\n  ^`)

    cy.get('[id="ace-editor"]')
    .type(getProgram(['{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}ov r0 r1', '']))

    cy.get('[id="results-box-id"]').should('not.have.value', `\nHubo un error de sintaxis: \n${program[0]}\n  ^`)
  })
})
 


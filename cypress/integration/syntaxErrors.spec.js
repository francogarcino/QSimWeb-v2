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

    cy.get('span.ace_gutter_annotation[aria-label="Warning, read annotations row 1"]').should('exist');
  })

  it('Fixing a program with syntax errors clears the error message', () => {
    const program = ['MV R0 R1', '']
    cy.get('[id="ace-editor"]')
      .type(getProgram(program))
    
    cy.get('span.ace_gutter_annotation[aria-label="Warning, read annotations row 1"]').should('exist');

    cy.get('[id="ace-editor"]')
    .type(getProgram(['{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}OV R0, R1', '']))

    cy.get('span.ace_gutter_annotation[aria-label="Warning, read annotations row 1"]').should('not.exist');
  })
})
 


/// <reference types="cypress" />
import { getProgram, assertRegisters } from "../helper"

context('SaveOptions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Writing a program and saving it shows success popup and maintain code after refresh ', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'MOV R2, 0x0002']))

    cy.get('[id="save-button"]:not([disabled])').click()

    cy.get('[id="client-snackbar"]').should('have.text', 'El código de la sesión se guardó correctamente')

    cy.reload()

    cy.get('[id="ace-editor"]').invoke('text').then((text) => {
      expect(text).to.contain('MOV R1, 0x0001')
      expect(text).to.contain('MOV R2, 0x0002')
    })

  })
  it('Downloading file shows success popup', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'MOV R2, 0x0002']))

    cy.get('[id="long-button"]:not([disabled])').click()

    cy.get('[id="download"]').click()

    cy.get('[id="client-snackbar"]').should('have.text', 'Se descargó el archivo correctamente')

  })
  it('Writing a program save and refresh then clearing clears code session ', () => {
    cy.get('[id="ace-editor"]')
      .type(getProgram(['MOV R1, 0x0001', 'MOV R2, 0x0002']))

    cy.get('[id="save-button"]:not([disabled])').click()

    cy.get('[id="client-snackbar"]').should('have.text', 'El código de la sesión se guardó correctamente')

    cy.reload()

    cy.get('[id="ace-editor"]').should('not.be.empty')   

    cy.get('[id="long-button"]:not([disabled])').click()

    cy.get('[id="clear"]').click()

    cy.get('[id="client-snackbar"]').should('have.text', 'El código de la sesión se eliminó')

    cy.reload()

    cy.get('[id="ace-editor"]').should('not.have.text')    

  })
})

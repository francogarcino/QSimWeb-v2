import { assertRegisters, rewriteConfig, getProgram } from "../helper"

describe('Disabled addressing modes', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  describe('Disable Register', () => {
    before(() => {
      rewriteConfig('addressing_mode', [
        {
          "name": "Register",
          "enabled": false,
          "display_name": "Registro"
        },
        {
          "name": "Immediate",
          "enabled": true,
          "display_name": "Inmediato"
        },
      ])
    })
    it('displays correct error', () => {
      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1, 0x0001']))

      cy.get('[id="Ejecutar-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Registro esta deshabilitado')
    })
  })
  describe('Disable Immediate', () => {
    before(() => {
      rewriteConfig('addressing_mode', [
        {
          "name": "Register",
          "enabled": true,
          "display_name": "Registro"
        },
        {
          "name": "Immediate",
          "enabled": false,
          "display_name": "Inmediato"
        },
      ])
    })
    it('displays correct error', () => {
      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1, 0x0001']))

      cy.get('[id="Ejecutar-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Inmediato esta deshabilitado')
    })
  })
  describe('Disable Direct', () => {
    before(() => {
      rewriteConfig('addressing_mode', [
        {
          "name": "Register",
          "enabled": true,
          "display_name": "Registro"
        },
        {
          "name": "Direct",
          "enabled": false,
          "display_name": "Directo"
        },
      ])
    })
    it('displays correct error', () => {
      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1, [0x0001]']))

      cy.get('[id="Ejecutar-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Directo esta deshabilitado')
    })
  })
  describe('Disable Indirect', () => {
    before(() => {
      rewriteConfig('addressing_mode', [
        {
          "name": "Register",
          "enabled": true,
          "display_name": "Registro"
        },
        {
          "name": "Indirect",
          "enabled": false,
          "display_name": "Indirecto"
        },
      ])
    })
    it('displays correct error', () => {
      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1, [[0x0001]]']))

      cy.get('[id="Ejecutar-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Indirecto esta deshabilitado')
    })
  })
  describe('Disable Indirect Register', () => {
    before(() => {
      rewriteConfig('addressing_mode', [
        {
          "name": "Register",
          "enabled": true,
          "display_name": "Registro"
        },
        {
          "name": "IndirectRegister",
          "enabled": false,
          "display_name": "Indirecto Registro"
        },
      ])
    })
    it('displays correct error', () => {
      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1, [R3]']))

      cy.get('[id="Ejecutar-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Indirecto Registro esta deshabilitado')
    })
  })
  describe('Using pop up', () => {
    it('displays correct error', () => {
      cy.get('[id="config-button"]').click()
      cy.get('[id="Q5"]').click()
      cy.get('[id="save-config-button"]').click()

      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1, [R3]']))

      cy.get('[id="Ejecutar-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Indirecto Registro esta deshabilitado')
    })
  })
})

describe('Change registers number', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  describe('MUL modifies R7', () => {
    beforeEach(() => {
      cy.visit('/')
    })
    describe('When true', () => {
      it('R7 is modified', () => {
        cy.get('[id="ace-editor"]')
          .type(getProgram(['MOV R1, 0x8000', 'MUL R1, 0x0002']))

        cy.get('[id="Ejecutar-button-id"]').click()

        cy.get('[id="results-box-id"]').should('have.value', 'La ejecución del programa fue exitosa')

        assertRegisters(['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0001'])
      })
    })
  })
})
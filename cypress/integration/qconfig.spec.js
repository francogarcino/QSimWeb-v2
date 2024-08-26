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
        .type(getProgram(['MOV R1 0x0001']))

      cy.get('[id="execute-button-id"]').click()

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
        .type(getProgram(['MOV R1 0x0001']))

      cy.get('[id="execute-button-id"]').click()

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
        .type(getProgram(['MOV R1 [0x0001]']))

      cy.get('[id="execute-button-id"]').click()

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
        .type(getProgram(['MOV R1 [[0x0001]]']))

      cy.get('[id="execute-button-id"]').click()

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
        .type(getProgram(['MOV R1 [R3]']))

      cy.get('[id="execute-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Indirecto Registro esta deshabilitado')
    })
  })
  describe('Using pop up', () => {
    it('displays correct error', () => {
      cy.get('[id="config-button"]').click()
      cy.get('[id="IndirectRegister"]').click()
      cy.get('[id="save-config-button"]').click()

      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1 [R3]']))

      cy.get('[id="execute-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El modo de direccionamiento Indirecto Registro esta deshabilitado')
    })
  })
})

describe('Disabled instructions', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  describe('Using pop up', () => {
    it('displays correct error', () => {
      cy.get('[id="config-button"]').click()
      cy.get('[id="MOV"]').click()
      cy.get('[id="save-config-button"]').click()

      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1 [R3]']))

      cy.get('[id="execute-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'La instruccion MOV esta deshabilitada')
    })
  })
})


describe('Change registers number', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  describe('Using pop up', () => {
    it('Writing a register which is disabled shows correct error', () => {
      cy.get('[id="config-button"]').click()
      cy.get('[id="registers_number"]').type('{backspace}{del}').type(7)
      cy.get('[id="save-config-button"]').click()

      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R7 0x3020']))

      cy.get('[id="execute-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El registro R7 esta deshabilitado')
    })
    it('Reading a register which is disabled shows correct error', () => {
      cy.get('[id="config-button"]').click()
      cy.get('[id="registers_number"]').type('{leftarrow}')
      cy.get('[id="save-config-button"]').click()

      cy.get('[id="ace-editor"]')
        .type(getProgram(['MOV R1 R7']))

      cy.get('[id="execute-button-id"]').click()

      cy.get('[id="client-snackbar"]').should('have.text', 'El registro R7 esta deshabilitado')
    })
  })

  describe('MUL modifies R7', () => {
    beforeEach(() => {
      cy.visit('/')
    })
    describe('When true', () => {
      before(() => {
        rewriteConfig('mul_modifies_r7', false)
      })
      it('Number of registers returns to 8', () => {
        cy.get('[id="config-button"]').click()
        cy.get('[aria-labelledby="discrete-slider"]').click()
        cy.get('[aria-labelledby="discrete-slider"]').should('have.attr', 'aria-valuenow', 8).type('{leftarrow}')
        cy.get('[aria-labelledby="discrete-slider"]').should('have.attr', 'aria-valuenow', 7)
      })
      it('R7 is modified', () => {
        cy.get('[id="config-button"]').click()
        cy.get('[id="mul_modifies_r7"]').click()
        cy.get('[id="save-config-button"]').click()

        cy.get('[id="ace-editor"]')
          .type(getProgram(['MOV R1 0x8000', 'MUL R1 0x0002']))

        cy.get('[id="execute-button-id"]').click()

        cy.get('[id="results-box-id"]').should('have.value', 'La ejecución fue exitosa')

        assertRegisters(['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0001'])
      })
    })
    describe('When false', () => {
      it('R7 is not modified', () => {
        cy.get('[id="config-button"]').click()
        cy.get('[id="save-config-button"]').click()

        cy.get('[id="ace-editor"]')
          .type(getProgram(['MOV R1 0x8000', 'MUL R1 0x0002']))

        cy.get('[id="execute-button-id"]').click()

        cy.get('[id="results-box-id"]').should('have.value', 'La ejecución fue exitosa')

        assertRegisters(['0000', '0000', '0000', '0000', '0000', '0000', '0000', '0000'])
      })
    })
  })
})
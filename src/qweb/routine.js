export class Routine {
  constructor(assembly_cell){
    this.from_cell = assembly_cell
    this.instructions = []
    this.name = ""
    this.labels = []
    this.start_line = 0
  }

  add_instruction(instruction){
    this.instructions.push(instruction)
  }

  setName(name) {
    this.name = name
  }

  setEditorLine(index) {
    this.start_line = index
  }
}

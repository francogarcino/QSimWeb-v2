export class Routine {
  constructor(assembly_cell){
    this.from_cell = assembly_cell
    this.instructions = []
    this.name = ""
  }

  add_instruction(instruction){
    this.instructions.push(instruction)
  }

  setName(name) {
    this.name = name
  }
}

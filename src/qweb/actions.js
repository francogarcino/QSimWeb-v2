export class Action{
  constructor(name, data){
    this.name = name
    this.data = data
  }
}

export const ACTIONS = {
  UPDATE_IR: 'update_ir',
  ASSIGN_PC: 'assign_pc',
  READ_REGISTER: 'read_register',
  WRITE_REGISTER: 'write_register',
  READ_MEMORY: 'read_memory',
  WRITE_MEMORY: 'write_memory',
  ASSEMBLE: 'assemble',
  WRITE_STACK: 'write_stack',
}
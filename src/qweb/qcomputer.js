import { Register, Immediate } from "./operands";
import qConfig from "./qConfig";
import { Action, ACTIONS } from "./actions";
import { Instruction } from "./instructions";
import { DefaultCellValue } from "./defaultValues";
import {
  DisabledRegisterError,
  ImmediateAsTarget,
  ExcecutionFinished,
  IncompleteRoutineError,
  TimeoutError,
} from "./exceptions";
import { getDetails, hexa, toHexa } from "../utils";
var {
  hex2dec,
  dec2hex,
  dec2bin,
  bin2dec,
  fixN,
  is_negative,
} = require("./helper");

const STAGE_FETCH = "fetch";
const STAGE_DECODE = "decode";
const STAGE_EXECUTE = "execute";
class Computer {
  constructor() {
    this.cell_length = 16;
    this.state = this.__get_state();
  }

  __get_state() {
    return new State(this.__get_registers(), new Memory());
  }

  __get_registers() {
    return [...Array(parseInt(qConfig.getItem("registers_number"))).keys()].map(
      (n) => new Register(n)
    );
  }

  restart() {
    this.state = this.__get_state();
  }

  load_many(routines) {
    this.state.begin_cells_load();
    let first_pc = hex2dec(routines[0].from_cell);
    let labels = this._calculate_labels(routines);
    this.state.PC = first_pc;

    this._update_routines_and_load(labels, routines);
    this.state.PC = first_pc;
    this.state.end_cells_load();
  }

  validate(instructions) {
    instructions.forEach((ins) => this.validate_one(ins));
  }

  validate_one(instruction) {
    if (instruction.target instanceof Immediate) {
      throw new ImmediateAsTarget(instruction);
    }
  }

  execute() {
    this.state.begin_fetch();
    let cell = this.state.read_memory(this.state.PC);
    let ___starttime___ = Date.now();

    while (true) {
      try {
        if (Date.now() > ___starttime___ + 5000) {
          throw new(TimeoutError)
        }
        this._execute_cycle(cell);
        this.state.begin_fetch();
        cell = this.state.read_memory(this.state.PC);
      } catch (error) {
        if (error instanceof ExcecutionFinished) {
          return [...this.state.actions];
        } else {
          throw error;
        }
      }
    }
  }

  execute_cycle() {
    try {
      this.state.begin_fetch();
      const cell = this.state.read_memory(this.state.PC);
      if (!isNaN(cell)) this._execute_cycle(cell);
    } catch (error) {
      if (error instanceof ExcecutionFinished) return [...this.state.actions];
      throw error;
    }
  }

  execute_cycle_detailed() {
    this.execute_cycle();

    const actions = [...this.state.actions];
    this.restart_actions();
    return actions;
  }

  _execute_cycle(cell) {
    this.state.new_instruction = true;
    this.state.begin_decode();
    const cell_value = fixN(16, dec2bin(cell));
    const instruction = Instruction.get_by_code(cell_value);
    this.state.update_ir(dec2hex(cell, 16), instruction.get_name());
    const assembled_instruction = instruction.disassemble(
      instruction,
      cell_value,
      this.state
    );
    this.state.increment_pc();
    this.state.begin_execute();
    assembled_instruction.execute_with_state(this.state);
  }

  restart_actions() {
    this.state.actions = [];
  }

  update_labels(instructions, labels) {
    return instructions.map((instruction) => {
      return instruction.update_label(labels, this.state);
    });
  }

  get_memory() {
    return this.state.get_memory();
  }

  _calculate_labels(routines) {
    let labels = [];
    routines.forEach((routine) => {
      this._load_pc_from_routine(routine);
      const initial_pc = this.state.PC;

      this.validate(routine.instructions);
      let calculated_labels = this.state.calculate_labels(routine.instructions);
      labels = labels.concat(calculated_labels);

      this.state.PC = initial_pc;
    });
    return labels;
  }

  _update_routines_and_load(labels, routines) {
    routines.forEach((routine) => {
      this._load_pc_from_routine(routine);

      const initial_pc = this.state.PC;
      routine.instructions = this.update_labels(routine.instructions, labels);
      this.state.PC = initial_pc;

      routine.instructions.forEach((instruction) => {
        instruction.load(this.state);
      });
    });
  }

  _load_pc_from_routine(routine) {
    if (routine.from_cell) this.state.PC = hex2dec(routine.from_cell);
  }

  _updatedFlag(id, value) {
    const flags = [this.state.N, this.state.V, this.state.C, this.state.Z];
    const flag = flags.find((f) => f.key === id);
    return Boolean(flag) && flag.value !== value;
  }

  get_updated_flags() {
    return [
      {
        key: "Z",
        value: computer.state.Z,
        name: "Zero",
        updated: this._updatedFlag("Z", computer.state.Z),
      },
      {
        key: "N",
        value: computer.state.N,
        name: "Negative",
        updated: this._updatedFlag("N", computer.state.N),
      },
      {
        key: "C",
        value: computer.state.C,
        name: "Carry",
        updated: this._updatedFlag("C", computer.state.C),
      },
      {
        key: "V",
        value: computer.state.V,
        name: "Overflow",
        updated: this._updatedFlag("V", computer.state.V),
      },
    ];
  }

  updatedRegister(id, value, registers) {
    const register = registers.find((r) => r.id === id);
    return Boolean(register) && register.value !== value;
  }

  get_updated_registers() {
    return this.state.registers.map((r) => {
      return {
        ...r,
        id: `R${r.id}`,
        value: hexa(r.value),
        details: getDetails(r.value),
        updated: r.updated, 
      };
    });
  }

  get_updated_special_registers(registers, specialRegisters) {
    const isSPUpdated = this.updatedRegister(
      "SP",
      toHexa(computer.state.SP),
      specialRegisters
    );
    let updatedRegisters = [];
    if (isSPUpdated) {
      updatedRegisters = registers.map((r) => {
        return {
          ...r,
          updated: isSPUpdated && r.id !== "SP" ? false : r.updated,
        };
      });
    }
    return {
      specialRegisters: [
        {
          id: "SP",
          value: toHexa(computer.state.SP),
          details: getDetails(computer.state.SP),
          updated: isSPUpdated,
        },
        {
          id: "PC",
          value: toHexa(computer.state.PC),
          details: getDetails(computer.state.PC),
        },
        {
          id: "IR",
          value: this.getIR(),
          details: [
            { key: "IR desensamblado:", value: computer.state.IR_DESCRIPTIVE },
          ].concat(getDetails(computer.state.IR)),
        },
      ],
      updatedRegisters,
    };
  }

  // TODO mejorar
  getIR() {
    const ir = computer.state.IR;
    return ir
      ? hexa(ir.match(/.{1,4}(?=(.{4})+(?!.))|.{1,4}$/g).join(" "))
      : "";
  }
}

class State {
  constructor(registers, memory) {
    this.registers = registers;
    this.memory = memory;
    this.PC = 0;
    this.SP = hex2dec("0xFFEF");
    this.IR = "";
    this.IR_DESCRIPTIVE = "";
    this.Z = false;
    this.N = false;
    this.C = false;
    this.V = false;
    this.actions = [];
    this.loading = false;
    this.current_stage = STAGE_FETCH;
    this.organic_pc = true;
    this.new_instruction = true;
  }

  load(binary) {
    binary
      .split(/(.{16})/)
      .filter((O) => O)
      .forEach((cell) => {
        const value = dec2hex(bin2dec(cell), 16);
        this.write_memory(this.PC, value);
        this.increment_pc();
      });
  }

  update_ir(value, descriptive_value) {
    var get_ir = (ir, val) => {
      return this.new_instruction ? String(val) : `${ir}${String(val)}`;
    };
    this.IR = get_ir(this.IR, value);
    this.IR_DESCRIPTIVE = get_ir(this.IR_DESCRIPTIVE, " " + descriptive_value);
    this.save_action(ACTIONS.UPDATE_IR, { ir: this.IR });
    this.new_instruction = false;
  }

  begin_cells_load() {
    this.loading = true;
  }

  end_cells_load() {
    this.loading = false;
  }

  begin_fetch() {
    this.current_stage = STAGE_FETCH;
  }

  begin_decode() {
    this.current_stage = STAGE_DECODE;
  }

  begin_execute() {
    this.current_stage = STAGE_EXECUTE;
  }

  increment_pc() {
    this.organic_pc = true;
    this.PC += 1;
  }

  offset_pc(offset) {
    this.organic_pc = false;
    this.PC += offset;
  }

  assign_pc(value) {
    this.organic_pc = false;
    this.save_action(ACTIONS.ASSIGN_PC, { value });
    this.PC = value;
  }

  recover_stack(value) {
    this.organic_pc = true;
    this.save_action(ACTIONS.ASSIGN_PC, { value });
    this.PC = value;
  }

  read_register(id) {
    const register_value = this.registers[id].value;
    this.save_action(ACTIONS.READ_REGISTER, {
      register: id,
      value: register_value,
    });
    return hex2dec(register_value);
  }

  write_register(id, value) {
    this.save_action(ACTIONS.WRITE_REGISTER, { register: id, value });
    this.registers[id].value = value;
    this.registers[id].updated = true;
    for (let key in this.registers) {
      if (parseInt(key) !== id) {
        this.registers[key].updated = false;
      }
    }
  }

  read_memory(cell_id) {
    this.MAR = this.PC;
    const value = this.memory.read(cell_id);

    if (
      value === undefined &&
      this.current_stage === STAGE_FETCH &&
      this.organic_pc
    ) {
      throw new (
        this.empty_stack() ? ExcecutionFinished : IncompleteRoutineError
      )();
    } else {
      this.MBR = hex2dec(
        value !== undefined ? value : this.get_default_value(cell_id)
      );
    }

    if (!isNaN(this.MBR))
      this.save_action(ACTIONS.READ_MEMORY, { cell: cell_id, value: this.MBR });
    return this.MBR;
  }

  empty_stack() {
    return this.SP === hex2dec("0xFFEF");
  }

  get_default_value(address) {
    const default_value_name = qConfig.getItem("default_value").cells;
    const default_value = new DefaultCellValue().find_subclass(
      default_value_name
    );
    return default_value.value(dec2hex(address, 16));
  }

  save_action(name, data) {
    this.actions.push(new Action(name, data));
  }

  write_memory(cell_id, value) {
    this.save_action(this.loading ? ACTIONS.ASSEMBLE : ACTIONS.WRITE_MEMORY, {
      cell: cell_id,
      value,
    });
    this.memory.write(cell_id, value);
  }

  write_stack(cell_id, value) {
    this.save_action(ACTIONS.WRITE_STACK, { cell: cell_id, value });
    this.memory.write(cell_id, value);
  }

  calculate_flags(target, source, result) {
    this._calculate_Z(result);
    this._calculate_N(result);
  }

  _calculate_Z(result) {
    this.Z = hex2dec(result) === 0;
  }

  _calculate_N(result) {
    this.N = is_negative(result);
  }

  calculate_labels(instructions) {
    const labels = [];

    return instructions.reduce((nlabels, ins) => {
      return ins.calculate_label(nlabels, this);
    }, labels);
  }

  get_memory() {
    return this.memory.get_all();
  }
}

class Memory {
  constructor() {
    this.values = {};
  }

  get_all() {
    return { ...this.values };
  }

  read(address) {
    return this.values[address];
  }

  write(address, value) {
    this.values[address] = value;
  }
}

const computer = new Computer();

export default computer;

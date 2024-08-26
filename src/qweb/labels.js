class LabelReference {
	constructor(name){
		this.name = name
	}
}

class LabelAddress {
  constructor(address, label){
    this.address = address
    this.label = label
  }
}

class Label {
	constructor(name, instruction) {
		this.name = name
		this.instruction = instruction
	}

	load(state){
		this.instruction.load(state)
	}

	calculate_label(labels, state){
		labels.push(new LabelAddress(state.PC, this.name))
		labels = this.instruction.calculate_label(labels, state)

		return labels
	}

	update_label(labels, state){
		return this.instruction.update_label(labels, state)
	}
}

const labels = {
	Label,
	LabelReference
}

export default labels
import config from './qweb/config'

export const codeTabsFileValidators = [
  textPlainValidator,
  maxSizeValidator,
  existingNameValidator,
]

export const configFormFileValidators = [
  textPlainOrJsonValidator,
  invalidKeysValidator,
  maxSizeValidator,
]

function textPlainOrJsonValidator(fileUploaded) {
  return fileUploaded.type === "text/plain" || fileUploaded.type === "application/json" ? null : "El tipo de archivo debe ser .txt o .json"
}

function invalidKeysValidator(fileUploaded, result){
  try{
    const configUploaded = JSON.parse(result)
    const keys = Object.keys(configUploaded)
    const configKeys = Object.keys(config)
    const errors = keys.filter(key => !configKeys.includes(key))
    return errors.length < 1 ? null : `El archivo contiene las siguientes claves invalidas: ${errors.join(', ')}` 
  }
  catch{
    return "El archivo no contiene un json valido"
  }
}

function textPlainValidator(fileUploaded) {
  return fileUploaded.type === "text/plain" ? null : "El tipo de archivo debe ser .txt"
}

function maxSizeValidator(fileUploaded) {
  return fileUploaded.size <= 1024 * 1024 ? null : "El tamaño de archivo debe ser menor a 1Mb"
}

function existingNameValidator(fileUploaded, names) {
  return names.some(name => name === fileUploaded.name) ? `No se pueden subir dos archivos con el mismo nombre: ${fileUploaded.name}` : null
}

export class FileValidator{
  constructor(fileValidators){
    this.validators = fileValidators
    this.hasErrors = false
    this.errors = ""
  }
  validate(...params){
    const errors = this.validators.reduce((errs, validator) => {
      const error = validator(...params)
      if (error !== null) {
        errs.push(error)
      }
    
      return errs
    }, [])

    this.hasErrors = errors.length !== 0
    this.errors = errors.join(', ')
  }
}
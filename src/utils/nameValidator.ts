export const nameValidator = (name: string): Boolean => {
  return /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ. ]+$/.test(name) &&
    String(name).trim().split(' ').length > 1 &&
    String(name).trim().split(' ').length <= 70
}

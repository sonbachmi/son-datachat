export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function querySelectorDefer(selector: string) {
  let timeout
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector)
    if (timeout) clearTimeout(timeout)
    if (element) {
      resolve(element)
      return
    }
    timeout = setTimeout(() => {
      resolve(querySelectorDefer(selector))
    }, 500)
  })
}
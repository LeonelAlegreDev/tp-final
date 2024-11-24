import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * Verifica si un valor existe en un array de string.
 * 
 * @param array - Array de string en el que se buscará el valor.
 * @returns Una función de validador que toma un AbstractControl y devuelve ValidationErrors o null.
 */
export function stringExistsInArrayValidator(array: string[]){
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value.toString();
        let exists = false;

        for (let element of array) {
            if (element === value as string) {
                exists = true;
                break;
            }
        }

        return exists ? null : { stringExistsInArray: true };
    }
}
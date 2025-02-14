import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore ("tienda",()=>{
    
    let prueba = ref("csasd")




    return{
        prueba
    }

})
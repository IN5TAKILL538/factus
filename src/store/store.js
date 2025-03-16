import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("administrador", () => {
    const token = ref(localStorage.getItem("token") || "");
    const refreshToken = ref(localStorage.getItem("refreshToken") || "");

    function set_Token_RefreshToken(Token, RefreshToken) {
        console.log("Intentando guardar token:", Token, RefreshToken);
        if (Token) {
            token.value = Token;
            refreshToken.value = RefreshToken;
            localStorage.setItem("token", Token);
            localStorage.setItem("refreshToken", RefreshToken);
        } else {
            console.log("No hay token ni refreshToken para guardar");
        }
    }

    return {
        token,
        refreshToken,
        set_Token_RefreshToken,
    };
}, { persist: true });
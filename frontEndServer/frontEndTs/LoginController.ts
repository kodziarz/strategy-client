import Cookies from 'js-cookie';
import envSettings from '../../settings.json';

interface userCredentials {
    username: string,
    password: string;
}

export default class LoginController {
    private url: string = `http://${envSettings.serverAddress}/login`;
    private loginInput: HTMLInputElement;
    private passwordInput: HTMLInputElement;

    constructor() {
        this.loginInput = document.getElementById('loginInput') as HTMLInputElement;
        this.passwordInput = document.getElementById('passwordInput') as HTMLInputElement;

        const loginButton = document.getElementById('loginButton') as HTMLInputElement;
        loginButton.onclick = this.onLogin;
    }

    onLogin = async () => {
        const data: userCredentials = {
            username: this.loginInput.value,
            password: this.passwordInput.value
        };

        const options = {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(data)
        };

        let response = await fetch(this.url, options);
        if (!response.ok) console.log('nie udało się wykonać zapytania');
        else {
            const data = await response.json();

            if (response.status === 201) {
                Cookies.set("token", data.access_token);
                await this.joinGame(data.access_token);
                document.location.href = "game.html";
            } else {
                alert('błędne dane');
            }
        }
    };

    joinGame = async (token: string) => {
        console.log("asking for joining game");
        const options = {
            headers: {
                'Authorization': "Bearer " + Cookies.get("token")
            }
        };

        let response = await fetch("http://localhost:3000/joinGame", options);
        let responseText = await response.text();
        return responseText;
    };
}
const loginController = new LoginController();

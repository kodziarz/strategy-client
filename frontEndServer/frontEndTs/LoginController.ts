import Cookies from 'js-cookie';

interface userCredentials {
    username: string,
    password: string;
}

export default class LoginController {
    private url: string = 'http://localhost:3000/login';
    private username: string;
    private password: string;
    constructor() {
        const loginInput = document.getElementById('loginInput');
        loginInput.oninput = () => this.setUsername((loginInput as HTMLInputElement).value);

        const passwordInput = document.getElementById('passwordInput');
        passwordInput.oninput = () => this.setPassword((passwordInput as HTMLInputElement).value);

        const loginButton = document.getElementById('loginButton');
        loginButton.onclick = this.onLogin;
    }

    onLogin = async () => {
        const data: userCredentials = {
            username: this.username,
            password: this.password
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
                document.location.href = "game.html";
            } else {
                alert('błędne dane');
            }
        }
    };

    setUsername = (username: string) => {
        this.username = username;
    };

    setPassword = (pass: string) => {
        this.password = pass;
    };
}
const loginController = new LoginController();

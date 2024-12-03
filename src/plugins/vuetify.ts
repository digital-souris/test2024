import { createVuetify } from 'vuetify';
import 'vuetify/styles/main.sass';

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#1976D2',
                    secondary: '#424242',
                },
            },
        },
    },
});

export default vuetify;

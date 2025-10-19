export declare const appConfig: {
    port: number;
    nodeEnv: string;
    modelMode: "env" | "database";
    env: {
        apiModelName: string;
        apiBaseUrl: string;
        apiKey: string;
    };
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    email: {
        apiKey: string;
        fromEmail: string;
    };
    admin: {
        username: string;
        password: string;
    };
};
export default appConfig;
//# sourceMappingURL=appConfig.d.ts.map
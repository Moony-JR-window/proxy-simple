// roleService.ts
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });

export async function getUserRole(username: string): Promise<string | undefined> {
    const command = new AdminGetUserCommand({
        UserPoolId: '1c4ppbepgkqg2mnji1qiklc7g8',
        Username: username,
    });
    const user = await cognitoClient.send(command);
    const roleAttr = user.UserAttributes?.find(attr => attr.Name === 'custom:role');
    return roleAttr?.Value;
}

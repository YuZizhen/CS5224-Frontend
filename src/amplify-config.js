const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'ap-southeast-1_289ahZRq6',
      userPoolClientId: 'h72u43jcos808i3mjbjqu9rnk',
      loginWith: {
        email: true,
      },
    },
  },
};

export default amplifyConfig;
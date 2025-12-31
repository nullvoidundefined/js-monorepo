/**
 * Navigation type definitions
 */

export type RootTabParamList = {
  Home: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

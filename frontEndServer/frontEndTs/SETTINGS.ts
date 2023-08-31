export default class SETTINGS {
    /**
     * Unit of position.
     * Should be used in every setting relating to position
     * on {@link Map}.
     * Aim is to be able to scale all the settings easily. 
     */
    static readonly unit = 1;
    /**Distance which is visible for observer on the {@link Map}. */
    static readonly visibilityRadius = 5 * SETTINGS.unit;
    /**Length of {@link MapField} side. */
    static readonly mapFieldSide = 20 * SETTINGS.unit;

    /**Fraction of viewport's width/height on which camera movement is enabled. */
    static readonly cameraMovingScreenPart = 0.1;
    /**
     * Coefficient describing a relation between camera z position (height)
     * and the camera velocity. Actual velocity is also dependent on mouse
     * position. Negative, because the z position of camera is negative.
     */
    static readonly cameraVelocityToZPositionCoeffictient = 2;

    static readonly GAME_MECHANICS_INTERVAL = 50; //[ms]
};
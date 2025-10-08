CREATE TABLE School_Data(
    school_data    BIGINT PRIMARY KEY,
    institution    VARCHAR(100) NOT NULL,
    course         VARCHAR(30) NOT NULL,
    calendar       VARCHAR(20) NOT NULL,
    shift          VARCHAR(20) NOT NULL,
);
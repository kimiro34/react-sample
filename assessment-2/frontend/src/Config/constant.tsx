export const REQUEST_API_URL = "/"
export const params = {
    param1: {
        id: 1,
        name: 'parameter1',
        max: 1,
        min: 0,
        step: 0.01,
        marks: [
            {
              value: 0,
              label: '0',
            },
            {
              value: 1,
              label: '1',
            },
        ]
    },
    param2: {
        id: 2,
        name: 'parameter2',
        max: 10,
        min: 0,
        step: 0.1,
        marks: [
            {
              value: 0,
              label: '0Hz',
            },
            {
              value: 10,
              label: '10Hz',
            },
        ]
    }
}
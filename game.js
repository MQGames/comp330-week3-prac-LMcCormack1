"use strict";

// Shader code

const vertexShaderSource = `
attribute vec4 a_position;
uniform float u_rotation; 

void main() {
    float x = a_position.x * cos(u_rotation) - a_position.y * sin(u_rotation);
    float y = a_position.x * sin(u_rotation) + a_position.y * cos(u_rotation);
    
    gl_Position = vec4(x,y,0,1);
}
`;

const fragmentShaderSource = `
precision mediump float;

void main() {
  gl_FragColor = vec4(1,0,0,1); 
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

function main() {

    // === Initialisation ===

    // get the canvas element & gl rendering 
    const canvas = document.getElementById("c");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        window.alert("WebGL not supported!");
        return;
    }

    //INPUT 
    let downKeyPressed = false;

    document.addEventListener("keydown", function(event) 
    {
        switch(event.key)
        {
            case "ArrowDown":downKeyPressed = true;
            break;
        }
    });
    document.addEventListener("keyup", function(event) 
    {
        switch(event.key)
        {
            case "ArrowDown":downKeyPressed = false;
            break;
        }
    });

    //RESIZE THE CANVAS
    let resizeCanvas = function() {
        const resolution= window.devicePixelRatio || 1.0;
        const displayWidth = Math.floor(canvas.clientWidth * resolution);
        const displayHeight = Math.floor(canvas.clientHeight * resolution);
        
        if (canvas.width !== displayWidth || canvas.height !== displayHeight) 
        {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            return true;
        }
        else 
        {
            return false;
        }    
    }
    
    // create GLSL shaders, upload the GLSL source, compile the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program =  createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // Initialise the array buffer to contain the points of the triangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,0,1]), gl.STATIC_DRAW);


    // Set up the position attribute
    // Note: This has to happen /after/ the array buffer is bound
    const positionAttribute = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    const rotationUniform = gl.getUniformLocation(program, "u_rotation");

    // === Per Frame operations ===
    let angle = 0;
    const turnSpeed = 1;
    let dx = 0;
    let dy = 0;
    const speed = 0.5;

    let update = function(deltaTime) {
        angle += turnSpeed * deltaTime;
        if (downKeyPressed)
        {
            dy -= speed * deltaTime;
        }
    };

    let render = function() {
        // clear the screen
        gl.viewport(0, 0, canvas.width, canvas.height);        
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        //give the rotation angle
        gl.uniform1f(rotationUniform, angle);

        // draw a triangle
        gl.drawArrays(gl.TRIANGLES, 0, 3);   
    };

    let oldTime = 0;
    let animate = function(time)
    {
        time /= 1000;
        const deltaTime = time - oldTime;
        oldTime = time;

        resizeCanvas();
        update(deltaTime);
        render();
        requestAnimationFrame(animate);
    }
    
    render();
    animate(0);
}    


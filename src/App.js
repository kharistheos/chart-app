import React, { Component } from 'react'
import { Chart, Bar } from 'react-chartjs-2';



export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        labels: ["sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"],
        datasets: [
          {
            label: "Videos Mades",
            backgroundColor: "rgba(255,0,255,30)",
            data: [4, 5, 1, 10, 32, 2, 12]
          },
          {
            label: "Subscriptions",
            backgroundColor: "rgba(0,255,0,0.75)",
            data: [14, 15, 21, 0, 12, 4, 32]
          }
        ]
      }
    }
  }



  render() {
    return (
      <div style={{ position: "relative", width: 800, height: 750 }}>
        <h3>Chart Samples</h3>
        <Bar
          options={{
            curvature: 5
          }}
          data={this.state.data}
          plugins={{
            id: "curvature",
            beforeInit: (chart, _easing) => {
              if (!chart.options.curvature) {
                return;
              }

              Chart.elements.Rectangle.prototype.draw = function () {
                const ctx = this._chart.ctx;
                const vm = this._view;

                let left, right, top, bottom, signX, signY, borderSkipped, radius;
                let borderWidth = vm.borderWidth;

                //set Radius Here
                //If the radius is large enought tocause drawing error, a max radius is impossed
                let cornerRadius = chart.options.curvature;
                if (cornerRadius > 20) {
                  console.log("Curvature of the rectangle can't be higher than 20.")
                  cornerRadius = 20;
                }
                if (!vm.horizontal) {
                  //bar is vertical
                  left = vm.x - vm.width / 2;
                  right = vm.x + vm.width / 2;
                  top = vm.y;
                  bottom = vm.base;

                  signX = 1;
                  signY = bottom > top ? 1 : -1;
                  borderSkipped = vm.borderSkipped || "bottom";
                } else {
                  // bar chart is horizontal
                  left = vm.base;
                  right = vm.x;
                  top = vm.y - vm.height / 2;
                  bottom = vm.y + vm.height / 2;
                  signX = right.left ? 1 : -1;
                  signY = 1;
                  borderSkipped = vm.borderSkipped || "left";
                }
                //Canvas doesn't allow us to make a stroke inside the width so we can
                //Adjust the sizes to fit we'rd setting a stroke on the line.
                if (borderWidth) {
                  const barSize = Math.min(
                    Math.abs(left - right),
                    Math.abs(top - bottom)
                  );

                  borderWidth = borderWidth > barSize ? barSize : borderWidth;
                  const halfStroke = borderWidth / 2;
                  //Adjust borderwidth when the bar top position is near vm.base(zero);
                  const borderLeft = left + (borderSkipped !== "left" ? halfStroke + signX : 0)
                  const borderRight = left + (borderSkipped !== "left" ? halfStroke + signX : 0);
                  const borderTop = top + (borderSkipped !== "top" ? halfStroke + signY : 0);
                  const borderBottom = bottom + (borderSkipped !== "bottom" ? halfStroke + signY : 0);
                  //not a vertical line
                  if (borderLeft !== borderRight) {
                    top = borderTop;
                    bottom = borderBottom;
                  }
                  //not a horizontal line
                  if (borderTop !== borderBottom) {
                    left = borderLeft;
                    right = borderRight;
                  }
                }
                //begin draw line
                ctx.beginPath();
                ctx.fillStyle = vm.backgroundColor;
                ctx.strokeStyle = vm.borderColor;
                ctx.lineWidth = borderWidth;

                //Corner Points, from bottom-left to bottom-right clockwise
                // |1 2|
                // |3 4|
                const corners = [
                  [left, bottom],
                  [left, top],
                  [right, top],
                  [right, bottom]
                ];
                //Find the firs (starting) corner width a fallback to the bottom
                const borders = ["bottom", "left", "top", "right"]
                let startCorner = borders.indexOf(borderSkipped, 0);
                if (startCorner === -1) {
                  startCorner = 0;
                }
                function cornerAt(index) {
                  return corners[(startCorner + index) % 4];
                }

                //Draw rectangle from the startCorner
                let corner = cornerAt(0);
                let width, height, x, y, nextCornerId, nextCorner;
                let xTL, xTR, yTL, yTR;
                let xBL, xBR, yBL, yBR;
                ctx.moveTo(corner[0], corner[1]);

                for (let i = 1; i < 4; i++) {
                  corner = cornerAt(i);
                  nextCornerId = i + 1;
                  if (nextCornerId === 4) {
                    nextCornerId = 0;
                  }

                  nextCorner = cornerAt(nextCornerId);
                  width = corners[2][0] - corners[1][0];
                  height = corners[0][1] - corners[1][1];
                  x = corners[1][0];
                  y = corners[1][1];

                  radius = cornerRadius;
                  //Fix radius if it's too large
                  if (radius > Math.abs(height) / 2) {
                    radius = Math.floor(Math.abs(height) / 2);
                  }
                  if (height < 0) {
                    //Negative values in a standard bar chart
                    xTL = x;
                    xTR = x + width;
                    yTL = y + height;
                    yTR = y + height;

                    xBL = x;
                    xBR = x + width;
                    yBL = y;
                    yBR = y;

                    //Draw!
                    ctx.moveTo(xBL + radius, yBL);
                    ctx.lineTo(xBR - radius, yBR);
                    ctx.quadraticCurveTo(xBR, yBR, xBR - radius);
                    ctx.lineTo(xTR, yTR + radius);
                    ctx.quadraticCurveTo(xTR, yTR, xTR - radius, yTR);
                    ctx.lineTo(xTL + radius, yTL);
                    ctx.quadraticCurveTo(xTL, yTL, xTL, yTL + radius);
                    ctx.lineTo(xBL, yBL - radius);
                    ctx.quadraticCurveTo(xBL, yBL, xBL + radius, yBL);

                  } else if (width < 0) {
                    //Negative values in a standard bar chart
                    xTL = x + width;
                    xTR = x;
                    yTL = y;
                    yTR = y;

                    xBL = x + width;
                    xBR = x;
                    yBL = y + height;
                    yBR = y + height;

                    //Draw!
                    ctx.moveTo(xBL + radius, yBL);
                    ctx.lineTo(xBR - radius, yBR);
                    ctx.quadraticCurveTo(xBR, yBR, xBR - radius);
                    ctx.lineTo(xTR, yTR + radius);
                    ctx.quadraticCurveTo(xTR, yTR, xTR - radius, yTR);
                    ctx.lineTo(xTL + radius, yTL);
                    ctx.quadraticCurveTo(xTL, yTL, xTL, yTL + radius);
                    ctx.lineTo(xBL, yBL - radius);
                    ctx.quadraticCurveTo(xBL, yBL, xBL + radius, yBL);
                  }
                  else {
                    ctx.moveTo(x + radius, y);
                    ctx.lineTo(x + width - radius, y);
                    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                    ctx.lineTo(x + width, y + height - radius);
                    ctx.quadraticCurveTo(
                      x + width,
                      y + height,
                      x + width - radius,
                      y + height
                    );
                    ctx.lineTo(x + radius, y + height);
                    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                    ctx.lineTo(x, y + radius);
                    ctx.quadraticCurveTo(x, y, x + radius, y);

                  }

                }
                ctx.fill();
                if (borderWidth) {
                  ctx.stroke();
                }



              }

            }
          }}
        />
      </div>
    )
  }
}

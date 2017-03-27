(function(){const handlebars=require("handlebars");module.exports=handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "                        <div class=\"tile_bar\" style=\"height:"
    + alias4(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"score","hash":{},"data":data}) : helper)))
    + " px; width: 5px\"> "
    + alias4(((helper = (helper = helpers.score || (depth0 != null ? depth0.score : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"score","hash":{},"data":data}) : helper)))
    + "</div>\r\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"topic-detail\">\r\n    <div class=\"tile_parameters\">\r\n        <div class=\"tile_parameter-group\">\r\n            <div class=\"topic-parameter-group\">\r\n                <div class=\"topic-discription\">\r\n                    <span>Time Graph</span>\r\n                    <div class=\"tile_chart\">\r\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.timeGraph : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "                    </div>\r\n\r\n                    <div class=\"tile_chart_d3\"></div>\r\n                </div>\r\n\r\n            </div>\r\n            <div class=\"topic-parameter-group\">\r\n                <div class=\"topic-discription\">\r\n                    <span>Topic List</span>\r\n                </div>\r\n                <div class=\"topic-parameter\" style=\"color: yellow\">\r\n                    <span>marathon ing finish</span>\r\n                </div>\r\n                <div class=\"topic-parameter\" style=\"color: magenta\">\r\n                    <span>marathon nyc edbanger</span>\r\n                </div>\r\n                <div class=\"topic-parameter\" style=\"color: green\">\r\n                    <span>love live matter</span>\r\n                </div>\r\n                <div class=\"topic-description\">\r\n                    <span>Exclusiveness</span>\r\n                    <div class=\"slider-container\" id=\"slider-exclusiveness\"></div>\r\n                </div>\r\n            </div>\r\n            \r\n        </div>\r\n    </div>\r\n</div>\r\n";
},"useData":true});}());
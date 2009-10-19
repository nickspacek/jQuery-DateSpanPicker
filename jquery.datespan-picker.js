( function ( $ ) {

$.fn.dateSpanPicker = function ( options ) {
	this.each( function () {
		new DateSpanPicker( this, options );
	});
	
	return this;
};

function DateSpanPicker ( target, options ) {
	var dsp = this;
	var _options = {};
	$.extend( _options, options, dsp.defaults );
	
	var allTimes = dsp._makeTimes();
	
	var $t = $( target );
	
	var $start_date = $( _options.classes.start_date, $t );
	var $start_time = $( _options.classes.start_time, $t );
	var $end_date = $( _options.classes.end_date, $t );
	var $end_time = $( _options.classes.end_time, $t );
	
	if( $start_date.val() == '' || $start_time.val() == ''
		|| $end_date.val() == '' || $end_time.val() == '' ) {
		var now = new Date();
		$start_date.val( dsp._dateToString( now ) );
		$start_time.val( dsp._dateToTimeString( now ) );
		$end_date.val( dsp._dateToString( now ) );
		$end_time.val( dsp._dateToTimeString( now ) );
	}
	
	$( 'input', $t ).each( function () {
		var $t = $( this );
		$t.data( 'newValue', $t.val() )
			.data( 'oldValue', $t.val() )
			.change( function () {
				$t.data( 'oldValue', $t.data( 'newValue' ) );
				$t.data( 'newValue', $t.val() );
				
				$t.trigger( 'changed' );
			});
	});

	$start_date.bind( 'changed', function () {
		dsp.linkUpdated(
			dsp.getDateFromFieldValues(
				$start_date.val(),
				$start_time.val()
			),
			dsp.getDateFromFieldValues(
				$start_date.data( 'oldValue' ),
				$start_time.val()
			),
			{
				date: $end_date,
				time: $end_time
			}
		);
	});
	$start_time.bind( 'changed', function () {
		dsp.linkUpdated(
			dsp.getDateFromFieldValues(
				$start_date.val(),
				$start_time.val()
			),
			dsp.getDateFromFieldValues(
				$start_date.val(),
				$start_time.data( 'oldValue' )
			),
			{
				date: $end_date,
				time: $end_time
			}
		);
	});

	$start_date.date_input( _options.date_input_defaults );
	$end_date.date_input( _options.date_input_defaults );

	$( _options.classes.all_day, $t ).change( function () {
		$start_time.toggle( !this.checked );
		$end_time.toggle( !this.checked );
	});
	
	$.each( [ $end_time, $start_time ], function () {
		var $this = this;
		$this
			.click( function () {
				if( $this.hasClass( 'picker-focus' ) ) {
					$this.data( 'time-chooser' ).filter( ':hidden' ).show();
				}
			})
			.keyup( function ( e ) {
				if( e.keyCode == 40 /* down */ ) {
					$( this ).click();
				}
			})
			.blur( function () {
				if( $this.data( 'timeClick' ) ) {
					$this.data( 'timeClick', false );
					return false;
				}
				$this.data( 'time-chooser' ).remove();
				$this.removeClass( 'picker-focus' ).removeData( 'time-chooser' );
			});
	});
	// TODO: Merge these focus things better or something
	$start_time.focus( function () {
		var $this = $( this );
		var offset = $this.offset();
		var times = allTimes.clone( true ).css({
			position: 'absolute',
			top: offset.top + $start_time.outerHeight(),
			left: offset.left
		}); // TODO: remove cloning
		$this.addClass( 'picker-focus' ).data( 'time-chooser', times ).after( times );
	});
	$end_time.focus( function (e) {
		var $this = $( this );
		var times;
		if( $start_date.val() == $end_date.val() ) {
			var minMinutes = dsp.getMinutesForTime( $start_time );
			times = dsp._makeTimes({
				minMinutes: minMinutes,
				liContent: function ( content, minutes ) {
					var diff = minutes - minMinutes;
					var hours = ( diff / 60 ) | 0;
					var mins = diff % 60 ? .5 : 0;
					var timeString;
					if( hours > 1 || ( hours == 1 && mins ) ) {
						timeString = hours + mins + ' hrs';
					}
					else if( hours < 1 ) {
						timeString = mins ? '30 mins' : '0 mins';
					}
					else if( hours == 1 && !mins ) {
						timeString = '1 hr';
					}
					return content + ' (' + timeString + ')';
				}
			}).addClass( 'picker-sameday' );
		}
		else {
			times = allTimes.clone( true ); // TODO: remove cloning
		}
		
		var offset = $this.offset();
		times.css({
			position: 'absolute',
			top: offset.top + $end_time.outerHeight(),
			left: offset.left
		});

		$this.addClass( 'focus' ).data( 'time-chooser', times ).after( times );
	});
}

DateSpanPicker.prototype.linkUpdated = function ( new_date, old_date, target ) {
	var target_date = this.getDateFromFieldValues(
		target.date.val(),
		target.time.val()
	);

	if( target_date < old_date ) {
		return;
	}

	target_date.setTime( new_date.getTime() + ( target_date - old_date ) );

	target.date.val( this._dateToString( target_date ) ).change();
	target.time.val( this._dateToTimeString( target_date ) ).change();
};
	
DateSpanPicker.prototype.getMinutesForTime = function ( element ) {
	var m;
	if( ( m = element.val().match(/(\d+):(\d+)(am|pm)/) ) && m.length == 4 ) {
		return parseInt( m[1] != 12 ? m[1] * 60 : 0 ) +
			parseInt( m[2] ) +
			parseInt( m[3] == 'pm' ? 720 : 0 );
	}
	else {
		throw 'Invalid text in element. (' + element.id + ')';
	}
};
	
DateSpanPicker.prototype.getDateFromFieldValues = function ( date, time ) {
	var d = this._stringToDate( date );
	var m = time.match( /^(\d+):(\d+)(am|pm)$/ );
	var hr = parseInt( m[1] == '12' ? 0 : m[1] ) + parseInt( m[3] == 'pm' ? 12 : 0 );
	d.setHours( hr, m[2] );
	return d;
};

DateSpanPicker.prototype._makeTimes = function ( options ) {
	var o = {
		minMinutes: 0,
		maxMinutes: 1440,
		liContent: null
	};
	$.extend( o, options );

	var con = $( '<ol>' ).addClass( 'picker-time-chooser' );
	
	for( var x = o.minMinutes; x < o.maxMinutes; x += 30 ) {
		var mer = 'am';
		var hr = x < 60 ? 12 : x / 60 | 0;
		var min = x % 60;
		if( x >= 720 ) mer = 'pm';
		if( x >= 780 ) hr -= 12;
		con.append( make( hr + ':' + ( min < 10 ? '0' + min : min ) + mer, x ) );
	}
	return con;
	
	function make( text, minutes ) {
		return $( '<li>' ).html( o.liContent ? o.liContent( text, minutes ) : text )
			.click( function () {
				$( this ).parent().prev()
					.val( text ).change()
				.end().hide();
			})
			.mousedown( function () {
				$( this ).parent().prev().data( 'timeClick', true );
			});
	}
}

DateSpanPicker.prototype._stringToDate = function ( string ) {
	var m;
	if( m = string.match( /^(\d{4})-(\d{2})-(\d{2})$/ ) ) {
		return new Date( m[1], m[2]-1, m[3] );
	}
	else {
		return null;
	};
}

DateSpanPicker.prototype._dateToString = function ( date ) {
	var month = ( date.getMonth() + 1 ).toString();
	var dom = date.getDate().toString();
	if( month.length == 1 ) month = "0" + month;
	if( dom.length == 1 ) dom = "0" + dom;
	return date.getFullYear() + "-" + month + "-" + dom;
}

DateSpanPicker.prototype._dateToTimeString = function ( date ) {
	var hour = date.getHours();
	var str = hour >= 12 ? 'pm' : 'am';
	hour = hour == 0 ? 12 : ( hour > 12 ? hour - 12 : hour );
	var min = date.getMinutes();
	min = min == 0 ? '00' : ( min < 10 ? '0' + min : min );
	str = hour + ':' + min + str;
	return str;
}

DateSpanPicker.prototype.defaults = {
	date_input_defaults: {
		stringToDate: DateSpanPicker.prototype._stringToDate,
		dateToString: DateSpanPicker.prototype._dateToString,
		short_day_names: ["S", "M", "T", "W", "T", "F", "S"],
		start_of_week: 0
	},
	classes: {
		start_date: '.picker-start-date',
		start_time: '.picker-start-time',
		end_date: '.picker-end-date',
		end_time: '.picker-end-time',
		all_day: '.picker-all-day'
	}
};

})( jQuery );

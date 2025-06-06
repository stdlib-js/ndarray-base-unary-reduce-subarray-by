/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

'use strict';

// MODULES //

var incrementOffsets = require( './increment_offsets.js' );
var setViewOffsets = require( './set_view_offsets.js' );
var offsets = require( './offsets.js' );
var wrap = require( './callback_wrapper.js' );


// MAIN //

/**
* Performs a reduction over an input ndarray according to a callback function and assigns results to a provided output ndarray.
*
* @private
* @param {Function} fcn - reduction function
* @param {Array<Object>} arrays - ndarrays
* @param {Array<Object>} views - initialized ndarray-like objects representing sub-array views
* @param {NonNegativeIntegerArray} ibuf - workspace for storing iteration indices
* @param {NonNegativeIntegerArray} ldims - list of loop dimensions
* @param {NonNegativeIntegerArray} cdims - list of "core" dimensions
* @param {IntegerArray} strides - loop dimension strides for the input ndarray
* @param {Options} opts - reduction function options
* @param {boolean} hasOpts - boolean indicating whether to pass an options argument to a reduction function
* @param {Function} clbk - callback function
* @param {thisArg} thisArg - callback execution context
* @returns {void}
*
* @example
* var Float64Array = require( '@stdlib/array-float64' );
* var filled = require( '@stdlib/array-base-filled' );
* var zeros = require( '@stdlib/array-base-zeros' );
* var ndarray2array = require( '@stdlib/ndarray-base-to-array' );
* var base = require( '@stdlib/ndarray-base-every-by' );
*
* function clbk( value ) {
*     return value > 0.0;
* }
*
* // Create data buffers:
* var xbuf = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 0.0, 7.0, 8.0, 9.0, 10.0, 11.0, 12.0 ] );
* var ybuf = filled( false, 3 );
*
* // Define the array shapes:
* var xsh = [ 3, 2, 2 ];
* var ysh = [ 3 ];
*
* // Define the array strides:
* var sx = [ 4, 2, 1 ];
* var sy = [ 1 ];
*
* // Define the index offsets:
* var ox = 0;
* var oy = 0;
*
* // Create an input ndarray-like object:
* var x = {
*     'dtype': 'float64',
*     'data': xbuf,
*     'shape': xsh,
*     'strides': sx,
*     'offset': ox,
*     'order': 'row-major'
* };
*
* // Create an output ndarray-like object:
* var y = {
*     'dtype': 'generic',
*     'data': ybuf,
*     'shape': ysh,
*     'strides': sy,
*     'offset': oy,
*     'order': 'row-major'
* };
*
* // Initialize ndarray-like objects representing sub-array views:
* var views = [
*     {
*         'dtype': x.dtype,
*         'data': x.data,
*         'shape': [ 2, 2 ],
*         'strides': [ 2, 1 ],
*         'offset': x.offset,
*         'order': x.order
*     }
* ];
*
* // Create a workspace array for storing iteration indices:
* var ibuf = zeros( xsh.length );
*
* // Define the loop and core dimensions:
* var ldims = [ 0 ];
* var cdims = [ 1, 2 ];
*
* // Resolve the loop dimension strides for the input array:
* var slx = [ 4 ];
*
* // Perform a reduction:
* unary1d( base, [ x, y ], views, ibuf, ldims, cdims, slx, null, false, clbk, {} );
*
* var arr = ndarray2array( y.data, y.shape, y.strides, y.offset, y.order );
* // returns [ true, false, true ]
*/
function unary1d( fcn, arrays, views, ibuf, ldims, cdims, strides, opts, hasOpts, clbk, thisArg ) {
	var ybuf;
	var dv0;
	var sh;
	var S0;
	var iv;
	var i0;
	var x;
	var y;
	var f;
	var i;

	// Note on variable naming convention: S#, dv#, i# where # corresponds to the loop number, with `0` being the innermost loop...

	// Cache a reference to the input ndarray:
	x = arrays[ 0 ];

	// Resolve the output ndarray and associated shape:
	y = arrays[ 1 ];
	sh = y.shape;

	// Extract loop variables for purposes of loop interchange: dimensions and loop offset (pointer) increments...
	S0 = sh[ 0 ];
	dv0 = [ strides[0] ];
	for ( i = 1; i < arrays.length; i++ ) {
		dv0.push( arrays[i].strides[0] );
	}
	// Resolve a list of pointers to the first indexed elements in the respective ndarrays:
	iv = offsets( arrays );

	// Cache a reference to the output ndarray buffer:
	ybuf = y.data;

	// Iterate over the non-reduced ndarray dimensions...
	for ( i0 = 0; i0 < S0; i0++ ) {
		setViewOffsets( views, iv );
		f = wrap( x.ref, ibuf, ldims, [ i0 ], cdims, clbk, thisArg );
		ybuf[ iv[1] ] = ( hasOpts ) ? fcn( views, opts, f ) : fcn( views, f );
		incrementOffsets( iv, dv0 );
	}
}


// EXPORTS //

module.exports = unary1d;

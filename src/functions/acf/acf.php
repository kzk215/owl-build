<?php
add_action('acf/init', function() {

	if( function_exists('acf_add_local_field_group') ):

		acf_add_local_field_group([
			'key' => 'group_comparison',
			'title' => '比較表',
			'fields' => [

				[
					'key' => 'field_header',
					'label' => 'ヘッダー',
					'name' => 'header',
					'type' => 'repeater',
					'sub_fields' => [
						[
							'key' => 'field_header_text',
							'label' => 'テキスト',
							'name' => 'text',
							'type' => 'text',
						],
					],
				],

				[
					'key' => 'field_rows',
					'label' => '行',
					'name' => 'rows',
					'type' => 'repeater',
					'sub_fields' => [

						[
							'key' => 'field_label',
							'label' => '項目名',
							'name' => 'label',
							'type' => 'text',
						],

						[
							'key' => 'field_cells',
							'label' => 'セル',
							'name' => 'cells',
							'type' => 'repeater',
							'sub_fields' => [

								[
									'key' => 'field_cell_text',
									'label' => 'テキスト',
									'name' => 'text',
									'type' => 'text',
								],
								[
									'key' => 'field_cell_status',
									'label' => 'ステータス',
									'name' => 'status',
									'type' => 'select',
									'choices' => [
										'excellent' => '◎',
										'good'      => '○',
										'fair'      => '△',
										'bad'       => '×',
									],
								],
							],
						],
					],
				],
			],

			'location' => [
				[
					[
						'param' => 'post_type',
						'operator' => '==',
						'value' => 'products',
					],
				],
			],
		]);

	endif;
});